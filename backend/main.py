

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, List, Literal, Any

import firebase_admin
from firebase_admin import credentials, functions

# Pydantic models should match the Zod schemas in the frontend for consistency
class PatientContext(BaseModel):
    age: Optional[int] = Field(None, gt=0)
    sex: Optional[Literal['male', 'female', 'other']] = None
    history: Optional[str] = None

class SymptomAnalysisRequest(BaseModel):
    symptoms: str = Field(..., min_length=10)
    patientContext: Optional[PatientContext] = None

# These match the Genkit flow's output schema now
class Diagnosis(BaseModel):
    name: str
    confidence: Optional[Literal['High', 'Medium', 'Low', 'Possible']] = None
    rationale: Optional[str] = None

class Investigation(BaseModel):
    name: str
    rationale: Optional[str] = None

class NextStep(BaseModel):
    title: str
    description: str
    toolId: str
    prefilledTopic: str
    cta: str

class SymptomAnalysisResponse(BaseModel):
    diagnoses: List[Diagnosis]
    suggestedInvestigations: Optional[List[Investigation]] = None
    suggestedManagement: Optional[List[str]] = None
    nextSteps: Optional[List[NextStep]] = None
    disclaimer: Optional[str] = None


class TaskItem(BaseModel):
    id: str
    text: str
    category: Literal['Lab Review', 'Follow-up', 'Patient Alert', 'Schedule']
    dueDate: Optional[str] = None
    priority: Optional[Literal['High', 'Medium', 'Low']] = None
    completed: bool

class RecentActivityItem(BaseModel):
    id: str
    text: str
    timestamp: str

class ProDashboardData(BaseModel):
    tasks: List[TaskItem]
    recentActivity: List[RecentActivityItem]

# --- App Initialization ---

app = FastAPI(
    title="MediAssistant Backend",
    description="API for AI-powered medical assistance tools.",
    version="0.1.0",
)

# Initialize Firebase Admin SDK
# Make sure your GOOGLE_APPLICATION_CREDENTIALS environment variable is set.
try:
    # Check if the app is already initialized
    if not firebase_admin._apps:
        firebase_admin.initialize_app()
    print("Firebase Admin SDK initialized successfully.")
except Exception as e:
    print(f"Error initializing Firebase Admin SDK: {e}")
    # In a real app, you might want to handle this more gracefully

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# --- API Endpoints ---

@app.get("/")
def read_root():
    """A simple health check endpoint."""
    return {"status": "ok", "message": "MediAssistant Python Backend is running!"}

@app.post("/api/analyze-symptoms", response_model=SymptomAnalysisResponse)
async def analyze_symptoms_endpoint(request: SymptomAnalysisRequest):
    """
    Analyzes symptoms by calling a Genkit flow via a Firebase Cloud Function.
    This acts as an orchestrator.
    """
    print(f"Received symptom analysis request for: {request.symptoms}")
    
    # The payload must match the input schema of the Genkit flow
    data_payload = {
        "symptoms": request.symptoms,
        "patientContext": request.patientContext.model_dump(exclude_none=True) if request.patientContext else {}
    }

    try:
        # Get a reference to the callable function
        # NOTE: The function name here must match the exported name from your Genkit flows file.
        # This assumes you have deployed 'symptomAnalyzerFlow' as a callable function.
        analyze_symptoms_func = functions.https_fn.callable_fn('symptomAnalyzerFlow')
        
        # Invoke the function
        result = await analyze_symptoms_func.call(data_payload)
        
        # Validate the response from the function call with our Pydantic model
        # The result.data will contain the JSON output from the Genkit flow
        return SymptomAnalysisResponse(**result.data)

    except functions.HttpsError as e:
        # Handle specific Firebase Functions errors
        print(f"Firebase Functions HttpsError: {e.code} - {e.message}")
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred with the AI service: {e.message}"
        )
    except Exception as e:
        # Handle other exceptions (e.g., network issues, validation errors)
        print(f"Error calling symptom analysis function: {e}")
        raise HTTPException(
            status_code=500, 
            detail=f"An unexpected error occurred: {str(e)}"
        )


@app.get("/api/pro/dashboard", response_model=ProDashboardData)
async def get_pro_dashboard_data():
    """Returns mock data for the Professional Clinical Dashboard."""
    # In a real app, this would fetch data from Firestore for the logged-in user
    mock_tasks = [
        {'id': 'task1', 'text': "Review Mr. Smith's latest CBC results", 'category': 'Lab Review', 'dueDate': 'Today', 'priority': 'High', 'completed': False},
        {'id': 'task2', 'text': 'Follow-up call with Mrs. Jones re: medication adjustment', 'category': 'Follow-up', 'dueDate': 'Tomorrow', 'priority': 'Medium', 'completed': False},
        {'id': 'task3', 'text': 'Patient Alert: John Doe - Critical lab value (K+ 2.5)', 'category': 'Patient Alert', 'priority': 'High', 'completed': False},
        {'id': 'task4', 'text': 'On-call shift: 7 PM - 7 AM', 'category': 'Schedule', 'dueDate': 'Today', 'completed': False},
        {'id': 'task5', 'text': 'Review imaging for Patient X', 'category': 'Lab Review', 'dueDate': 'Today', 'priority': 'Medium', 'completed': True},
    ]
    mock_activity = [
        {'id': 'act1', 'text': 'You generated a discharge summary for patient Jane Doe.', 'timestamp': '2 hours ago'},
        {'id': 'act2', 'text': 'Medico-legal documentation for Case #456 was updated.', 'timestamp': '5 hours ago'},
    ]
    return {"tasks": mock_tasks, "recentActivity": mock_activity}
