import React from 'react';

const NotificationPanelCompact: React.FC = () => {
  return (
    <div className="notification-panel-compact bg-white shadow-md p-4">
      <h2 className="text-lg font-bold">Notifications</h2>
      <p>No new notifications.</p>
    </div>
  );
};

export default NotificationPanelCompact;
