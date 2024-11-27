import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import Login from './pages/Login';
import IntroScreen from './pages/IntroScreen';
import ChatInterface from './pages/ChatInterface';
import JobDescription from './pages/JobDescription';
import JDViewer from './pages/JDViewer';
import { readLink } from './Link/LinkGenerator';

function App() {
  const [viewJDViewerBool, setViewJDViewerBool] = useState(false);
  const [linkProcessed, setLinkProcessed] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Process the link only once
    if (!linkProcessed) {
      const queryParams = new URLSearchParams(window.location.search);
      const hashLink = queryParams.get('id');

      if (hashLink) {
        try {
          const decryptedData = readLink(hashLink); // Decrypt the link
          const { Email, ConversationNumber } = decryptedData;

          if (Email && ConversationNumber) {
            // Store the decrypted data in localStorage
            localStorage.setItem('sharedEmail', Email);
            localStorage.setItem('sharedConversationNumber', ConversationNumber);
            
            // Set the ViewJDViewer to true
            localStorage.setItem('ViewJDViewerBool', 'true');

            console.log('Decrypted link data:', { Email, ConversationNumber });

            // Mark link as processed
            setLinkProcessed(true);
            setViewJDViewerBool(true);
          } else {
            console.error('Decrypted data missing fields:', decryptedData);
          }
        } catch (error) {
          console.error('Error decrypting link:', error);
        }
      }
    }
  }, [linkProcessed, navigate]);

  return (
    <Routes>
      <Route path="/" element={<Login viewJDViewerBool={viewJDViewerBool} />} />
      <Route path="/intro" element={<IntroScreen />} />
      <Route path="/chat" element={<ChatInterface />} />
      <Route path="/jobdescription" element={<JobDescription />} />
      <Route path="/jdviewer" element={<JDViewer />} />
    </Routes>
  );
}

export default App;