import React, { useEffect, useState } from 'react';
import { getDoc, updateDoc, arrayUnion, doc } from '../firebase/firebase';
import { db } from '../firebase/firebase';
import './JDViewer.css'; // Assuming the styles for JD Viewer are already in this file.

const JDViewer = () => {
  const [jdData, setJDData] = useState(null); // Use setJDData to update job description data
  const [showLinkPopup, setShowLinkPopup] = useState(false);
  const [generatedLink, setGeneratedLink] = useState('');
  const userEmail = localStorage.getItem('userEmail'); // Retrieve logged-in user's email
  const sharedEmail = localStorage.getItem('sharedEmail'); // Retrieve shared email
  const sharedConversationNumber = localStorage.getItem('sharedConversationNumber'); // Retrieve conversation number

  // Fetch Job Description and Log ViewedBy on component load
  useEffect(() => {
    if (sharedConversationNumber && sharedEmail) {
      fetchJobDescription();
      logViewedBy();
    }
  }, [sharedConversationNumber, sharedEmail]);

  // Fetch Job Description from Firestore
  const fetchJobDescription = async () => {
    try {
      const conversationPath = `ProjectBrainsReact/User/${sharedEmail}/userdetails/Conversations/Conversation${sharedConversationNumber}`;
      const conversationDocRef = doc(db, conversationPath); // Use db from firebase.js
      const conversationSnapshot = await getDoc(conversationDocRef);

      if (conversationSnapshot.exists()) {
        const jdData = conversationSnapshot.data();
        setJDData(jdData?.JDCreated || 'No JD available'); // Update JD data in state
      } else {
        setJDData('No JD available'); // Show fallback message if no JD found
      }
    } catch (error) {
      console.error('Error fetching job description:', error);
    }
  };

  // Log the current user as a viewer
  const logViewedBy = async () => {
    try {
      const conversationPath = `ProjectBrainsReact/User/${sharedEmail}/userdetails/Conversations/Conversation${sharedConversationNumber}`;
      const conversationDocRef = doc(db, conversationPath);

      await updateDoc(conversationDocRef, {
        ViewedBy: arrayUnion(userEmail), // Append logged-in user's email to ViewedBy
      });
      console.log('User email logged in ViewedBy array.');
    } catch (error) {
      console.error('Error logging ViewedBy email:', error);
    }
  };

  // Handle sharing the link
  const handleShare = async () => {
    try {
      // Define the Firestore path to the conversation document
      const conversationPath = `ProjectBrainsReact/User/${sharedEmail}/userdetails/Conversations/Conversation${sharedConversationNumber}`;
      const conversationDocRef = doc(db, conversationPath);
  
      // Fetch the existing conversation document
      const conversationSnapshot = await getDoc(conversationDocRef);
  
      if (conversationSnapshot.exists()) {
        const conversationData = conversationSnapshot.data();
  
        // Check if the LinkCreated field exists
        if (conversationData.LinkCreated) {
          setGeneratedLink(conversationData.LinkCreated); // Display the existing link
          setShowLinkPopup(true); // Show the popup
          console.log('Link fetched from Firestore and displayed:', conversationData.LinkCreated);
        } else {
          console.error('No link found in Firestore.');
        }
      } else {
        console.error('Conversation document does not exist.');
      }
    } catch (error) {
      console.error('Error fetching the link from Firestore:', error);
    }
  };
  

  return (
    <div className="jdviewer-container">
      <header className="jdviewer-header">
        <h1 className="jdviewer-title">Job Description Viewer</h1>
        <div className="jdviewer-buttons">
          <button className="jdviewer-share-button" onClick={handleShare}>
            Share
          </button>
        </div>
      </header>

      <section className="jdviewer-content">
        <div className="jdviewer-scrollable">
          <pre>{jdData || 'Loading...'}</pre>
        </div>
      </section>

      {/* Link Popup */}
      {showLinkPopup && (
        <div className="link-popup">
          <h2>Link Generated</h2>
          <p>{generatedLink}</p>
          <button onClick={() => setShowLinkPopup(false)}>Close</button>
        </div>
      )}
    </div>
  );
};


export default JDViewer;
