import React, { useEffect, useState } from 'react';
import { getDoc, updateDoc, arrayUnion, doc } from '../firebase/firebase';
import './JDViewer.css'; // Assuming the styles for JD Viewer are already in this file.

const JDViewer = () => {
  const [jdData, setJDData] = useState(null);
  const [showLinkPopup, setShowLinkPopup] = useState(false);
  const [generatedLink, setGeneratedLink] = useState('');
  const userEmail = localStorage.getItem('userEmail');
  const sharedConversationNumber = localStorage.getItem('sharedConversationNumber');

  useEffect(() => {
    if (sharedConversationNumber && userEmail) {
      fetchJobDescription();
      logViewedBy();
    }
  }, [sharedConversationNumber, userEmail]);

  const fetchJobDescription = async () => {
    try {
      const conversationPath = `ProjectBrainsReact/User/${userEmail}/userdetails/Conversations/Conversation${sharedConversationNumber}`;
      const docRef = doc(db, conversationPath);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setJDData(docSnap.data().JDCreated || 'No description available');
      } else {
        setJDData('No description available');
        console.error('No JD found in Firestore.');
      }
    } catch (error) {
      console.error('Error fetching job description:', error);
      setJDData('Error loading job description.');
    }
  };

  const logViewedBy = async () => {
    try {
      const conversationPath = `ProjectBrainsReact/User/${userEmail}/userdetails/Conversations/Conversation${sharedConversationNumber}`;
      const conversationDocRef = doc(db, conversationPath);

      await updateDoc(conversationDocRef, {
        ViewedBy: arrayUnion(userEmail), // Append logged-in user's email to ViewedBy
      });
      console.log('User email logged in ViewedBy array.');
    } catch (error) {
      console.error('Error logging ViewedBy email:', error);
    }
  };

  const handleShare = async () => {
    try {
      const conversationPath = `ProjectBrainsReact/User/${userEmail}/userdetails/Conversations/Conversation${sharedConversationNumber}`;
      const conversationDocRef = doc(db, conversationPath);

      await updateDoc(conversationDocRef, {
        SharedBy: arrayUnion(userEmail), // Append logged-in user's email to SharedBy
      });

      // Generate a dummy link for sharing (replace with actual logic)
      const hashLink = `https://example.com?id=generatedHashValue`;
      setGeneratedLink(hashLink);
      setShowLinkPopup(true);
      console.log('Link generated and saved to SharedBy.');
    } catch (error) {
      console.error('Error generating or saving link:', error);
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
