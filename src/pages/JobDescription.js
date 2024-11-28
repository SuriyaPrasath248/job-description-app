import React, { useState, useEffect } from 'react';
import './JobDescription.css';
import { createLink } from '../Link/LinkGenerator';
import { getFirestore, doc, updateDoc, getDoc, arrayUnion } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

const JobDescription = () => {
  const [generatedJD, setGeneratedJD] = useState('');
  const [showSessionFeedback, setShowSessionFeedback] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLinkPopup, setShowLinkPopup] = useState(false);
  const [generatedLink, setGeneratedLink] = useState('');
  const navigate = useNavigate(); // Initialize navigate

  const db = getFirestore();

  useEffect(() => {
    const jd = localStorage.getItem('generatedJD');
    if (jd) {
      setGeneratedJD(jd);
      console.log("Loaded Job Description:", jd);
    } else {
      console.error("Job Description not found in localStorage.");
    }
  }, []);

  const handleFeedbackSubmit = async () => {
    setIsSubmitting(true);
    console.log("Submitting feedback:", { feedbackRating, feedbackComment });

    const userEmail = localStorage.getItem('userEmail');
    const conversationNumber = localStorage.getItem('conversationNumber');
    const conversationPath = `ProjectBrainsReact/User/${userEmail}/userdetails/Conversations/Conversation${conversationNumber}`;
    const conversationDocRef = doc(db, conversationPath);

    try {
      const conversationSnapshot = await getDoc(conversationDocRef);
      if (!conversationSnapshot.exists()) {
        console.error("Conversation document not found.");
        return;
      }

      // Update conversation data with feedback
      const updatedData = {
        SessionFeedback: feedbackRating,
        AdditionalFeedback: feedbackComment,
      };

      await updateDoc(conversationDocRef, updatedData);

      // Generate hash link
      const hashLink = createLink(conversationNumber, userEmail);
      console.log("Generated Hash Link:", hashLink);

      // Save the generated link in state to display in the popup
      setGeneratedLink(hashLink);

      setShowSessionFeedback(false);
      setFeedbackRating(0);
      setFeedbackComment('');
      setShowLinkPopup(true); // Show link popup
    } catch (error) {
      console.error("Error submitting feedback:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLinkClick = () => {
    console.log("Link clicked. Redirecting to login...");
    navigate("/"); // Redirect to login page
  };

  const handleShareClick = async () => {
    const userEmail = localStorage.getItem('userEmail');
    const conversationNumber = localStorage.getItem('conversationNumber');
    const conversationPath = `ProjectBrainsReact/User/${userEmail}/userdetails/Conversations/Conversation${conversationNumber}`;
    const conversationDocRef = doc(db, conversationPath);
  
    try {
      // Generate hash link
      const hashLink = createLink(conversationNumber, userEmail);
      console.log('Generated Hash Link:', hashLink);
  
      // Push the generated link to Firebase
      await updateDoc(conversationDocRef, {
        LinkCreated: hashLink,
        SharedBy: arrayUnion(userEmail), // Add the current user's email to the SharedBy array
      });
  
      console.log('Link pushed to Firebase successfully.');
  
      setGeneratedLink(hashLink);
      setShowLinkPopup(true); // Show the Link Popup
    } catch (error) {
      console.error('Error generating or pushing link:', error);
    }
  };
  
  

  return (
    <div className="job-description-page">
      <header className="job-description-header">
        <h2>Brand Manager - Job Description</h2>
        <div className="job-description-buttons">
          <button className="share-button" onClick={handleShareClick}>
            Share
          </button>
          <button
            className="create-button"
            onClick={() => {
              console.log('Feedback button clicked');
              setShowSessionFeedback(true);
            }}
          >
            Submit Feedback
          </button>
        </div>
      </header>
      <main className="job-description-content">
        {generatedJD ? (
          <p dangerouslySetInnerHTML={{ __html: generatedJD }}></p>
        ) : (
          <p>No Job Description generated yet.</p>
        )}
      </main>

      {/* Link Popup */}
      {showLinkPopup && (
        <div className="link-popup">
          <div className="popup-content">
            <h3>Shareable Link</h3>
            <p>Your session link has been generated:</p>
            <a href={generatedLink} target="_blank" rel="noopener noreferrer">
              {generatedLink}
            </a>
            <button onClick={() => setShowLinkPopup(false)}>Close</button>
          </div>
        </div>
      )}

      {/* Session Feedback Popup */}
      {showSessionFeedback && (
        <div className="session-feedback-popup">
          <div className="session-popup-content">
            <h3>Session Feedback</h3>
            <p>Please rate your experience below</p>
            <div className="session-star-rating">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className={`session-star ${
                    feedbackRating >= star ? 'session-selected' : ''
                  }`}
                  onClick={() => {
                    console.log(`Star ${star} clicked`);
                    setFeedbackRating(star);
                  }}
                >
                  ★
                </span>
              ))}
              <span>{feedbackRating} / 5 stars</span>
            </div>
            <textarea
              className="session-feedback-textarea"
              placeholder="Enter feedback..."
              value={feedbackComment}
              onChange={(e) => {
                console.log("Feedback comment updated:", e.target.value);
                setFeedbackComment(e.target.value);
              }}
            ></textarea>
            <button
              className="session-submit-feedback-button"
              onClick={handleFeedbackSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobDescription;
