const functions = require('firebase-functions');
const axios = require('axios');
const admin = require('firebase-admin');
admin.initializeApp();


// Helper to throw a consistent HttpsError from external API errors
const throwHttpsErrorFromApi = (error, apiName) => {
  console.error(`Error calling ${apiName} API:`, error.response ? error.response.data : error.message);
  let message = `An error occurred with the ${apiName} API.`;
  if (error.response) {
    message = `API Error from ${apiName}: ${error.response.status} - ${JSON.stringify(error.response.data).substring(0, 100)}`;
  } else if (error.request) {
    message = `No response from ${apiName} API.`;
  } else {
    message = `Error setting up ${apiName} API request: ${error.message}`;
  }
  throw new functions.https.HttpsError('internal', message);
};


// Search Drug via OpenFDA
exports.searchDrug = functions.https.onCall(async (data, context) => {
  const drugName = data.drugName;
  if (!drugName) {
    throw new functions.https.HttpsError('invalid-argument', 'Drug name is required.');
  }
  try {
    const response = await axios.get(`https://api.fda.gov/drug/label.json?search=${encodeURIComponent(drugName)}&limit=1`);
    if (response.data && response.data.results && response.data.results.length > 0) {
      return response.data.results[0];
    } else {
      return { message: 'No drug data found for the specified name on OpenFDA.' };
    }
  } catch (error) {
    throwHttpsErrorFromApi(error, 'OpenFDA');
  }
});

// Search Gene via MedlinePlus Genetics
exports.searchGene = functions.https.onCall(async (data, context) => {
  const geneName = data.geneName;
  if (!geneName) {
    throw new functions.https.HttpsError('invalid-argument', 'Gene name is required.');
  }
  try {
    const response = await axios.get(
      `https://connect.medlineplus.gov/service?mainSearchCriteria.v.cs=2.16.840.1.113883.6.1&mainSearchCriteria.v.c=${encodeURIComponent(geneName)}&knowledgeResponseType=application/json`
    );
    if (response.data && response.data.feed && response.data.feed.entry && response.data.feed.entry.length > 0) {
      const entry = response.data.feed.entry[0];
      return {
        title: entry.title && entry.title._value ? entry.title._value : 'No title found',
        summary: entry.summary && entry.summary._value ? entry.summary._value.substring(0,500) + '...' : 'No summary found',
        link: entry.link && entry.link[0] && entry.link[0].href ? entry.link[0].href : null
      };
    } else {
      return { message: 'No gene data found for the specified name on MedlinePlus Connect or unexpected JSON structure.' };
    }
  } catch (error) {
    throwHttpsErrorFromApi(error, 'MedlinePlus Connect');
  }
});


// Example for HIPAASpace ICD-10 (Requires API Token)
exports.searchICD10 = functions.https.onCall(async (data, context) => {
  const diseaseName = data.diseaseName;
  const apiToken = functions.config().hipaaspace ? functions.config().hipaaspace.key : null;

  if (!apiToken) {
      console.error("HIPAASpace API key not configured in Firebase Functions config.");
      throw new functions.https.HttpsError('failed-precondition', 'API key for HIPAASpace not configured.');
  }

  if (!diseaseName) {
    throw new functions.https.HttpsError('invalid-argument', 'Disease name is required.');
  }
  try {
    const response = await axios.get(
      `https://www.hipaaspace.com/api/icd10/search?q=${encodeURIComponent(diseaseName)}&token=${apiToken}`
    );
    if (response.data && Array.isArray(response.data) && response.data.length > 0) {
      const firstResult = response.data[0];
      return {
        name: firstResult.Description || firstResult.description || 'N/A',
        code: firstResult.Code || firstResult.code || 'N/A'
      };
    } else if (response.data && response.data["no results"]){
        return { message: `No ICD-10 codes found for "${diseaseName}" on HIPAASpace.` };
    }
     else {
      return { message: `No ICD-10 codes found for "${diseaseName}" on HIPAASpace or unexpected response.` };
    }
  } catch (error) {
    throwHttpsErrorFromApi(error, 'HIPAASpace ICD-10');
  }
});

// Simple health check function
exports.healthCheck = functions.https.onCall(async (data, context) => {
  console.log("Health check function called. Data:", data, "Context Auth:", context.auth ? "Authenticated" : "Unauthenticated");
  return { status: "ok", timestamp: new Date().toISOString(), message: "Backend API is responsive." };
});


// New Function for YouTube Search
exports.searchYouTubeVideos = functions.https.onCall(async (data, context) => {
  const query = data.query;
  const apiKey = functions.config().youtube ? functions.config().youtube.key : null;

  if (!apiKey) {
    console.error("YouTube API key not configured in Firebase Functions config.");
    throw new functions.https.HttpsError('failed-precondition', 'API key for YouTube service not configured.');
  }

  if (!query) {
    throw new functions.https.HttpsError('invalid-argument', 'Search query is required.');
  }

  try {
    const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
      params: {
        part: 'snippet',
        q: `${query} medical lecture`,
        key: apiKey,
        type: 'video',
        maxResults: 12,
        relevanceLanguage: 'en',
        safeSearch: 'moderate',
        videoCategoryId: '27', // Education Category
      },
    });
    
    // Defensive check for unexpected successful response structure
    if (!response.data || !Array.isArray(response.data.items)) {
        console.warn('YouTube API returned a successful response but the items array is missing or not an array.', response.data);
        return { videos: [] }; // Return an empty array to prevent crashes.
    }
    
    // Filter for items that are definitely videos and have necessary data
    const videos = response.data.items
      .filter(item => item && item.id && item.id.videoId && item.snippet)
      .map(item => ({
        id: item.id.videoId,
        title: item.snippet.title,
        thumbnail: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url,
        channel: item.snippet.channelTitle,
    }));
    
    return { videos };

  } catch (error) {
    throwHttpsErrorFromApi(error, 'YouTube Data API');
  }
});

// The invokeMedGemma function is no longer needed by the MbbsStudyAgent and can be removed.
// I am removing it to clean up the backend code.
// exports.invokeMedGemma = ...
