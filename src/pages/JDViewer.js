import React, { useEffect, useState } from 'react';
import { getDoc, updateDoc, arrayUnion, doc } from '../firebase/firebase';
import { db } from '../firebase/firebase';
import './JDViewer.css';

const JDViewer = () => {
  const [jdData, setJDData] = useState(null);
  const [showLinkPopup, setShowLinkPopup] = useState(false);
  const [generatedLink, setGeneratedLink] = useState('');
  const userEmail = localStorage.getItem('userEmail');
  const sharedEmail = localStorage.getItem('sharedEmail');
  const sharedConversationNumber = localStorage.getItem('sharedConversationNumber');

  useEffect(() => {
    if (sharedConversationNumber && sharedEmail) {
      fetchJobDescription();
      logViewedBy();
    }
  }, [sharedConversationNumber, sharedEmail]);

  const fetchJobDescription = async () => {
    try {
      const conversationPath = `ProjectBrainsReact/User/${sharedEmail}/userdetails/Conversations/Conversation${sharedConversationNumber}`;
      const conversationDocRef = doc(db, conversationPath);
      const conversationSnapshot = await getDoc(conversationDocRef);

      if (conversationSnapshot.exists()) {
        const jdData = conversationSnapshot.data();
        setJDData(jdData?.JDCreated || 'No JD available');
      } else {
        setJDData('No JD available');
      }
    } catch (error) {
      console.error('Error fetching job description:', error);
    }
  };

  const logViewedBy = async () => {
    try {
      const conversationPath = `ProjectBrainsReact/User/${sharedEmail}/userdetails/Conversations/Conversation${sharedConversationNumber}`;
      const conversationDocRef = doc(db, conversationPath);

      await updateDoc(conversationDocRef, {
        ViewedBy: arrayUnion(userEmail),
      });
      console.log('User email logged in ViewedBy array.');
    } catch (error) {
      console.error('Error logging ViewedBy email:', error);
    }
  };

  const handleShare = async () => {
    try {
      const conversationPath = `ProjectBrainsReact/User/${sharedEmail}/userdetails/Conversations/Conversation${sharedConversationNumber}`;
      const conversationDocRef = doc(db, conversationPath);
  
      // Fetch the existing document
      const conversationSnapshot = await getDoc(conversationDocRef);
  
      if (conversationSnapshot.exists()) {
        const conversationData = conversationSnapshot.data();
  
        // Update SharedBy with the logged-in user's email
        await updateDoc(conversationDocRef, {
          SharedBy: arrayUnion(userEmail),
        });
        console.log('User email added to SharedBy array.');
  
        // Check if LinkCreated exists
        if (conversationData.LinkCreated) {
          setGeneratedLink(conversationData.LinkCreated); // Set the fetched link
          setShowLinkPopup(true); // Show the popup
          console.log('Link fetched and displayed:', conversationData.LinkCreated);
        } else {
          console.error('No link found in Firestore for this conversation.');
        }
      } else {
        console.error('Conversation document does not exist.');
      }
    } catch (error) {
      console.error('Error during handleShare operation:', error);
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
