"use client";
import 'bootstrap/dist/css/bootstrap.min.css';
import init from '../../../common/init';
import { collection, doc, getDocs, getDoc, addDoc } from "firebase/firestore";
import { useState, useEffect } from 'react';
import Headerpublic from '@/app/Components/headerpublic';
import { useParams } from 'next/navigation';
import { onAuthStateChanged } from "firebase/auth";
import Link from "next/link";

export default function TopicContent() {
  const [topic, setTopic] = useState(null);
  const [comments, setComments] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [content, setContent] = useState('');

  const { forumId, topicId } = useParams();
  const { auth, db } = init();
  console.log(forumId);
  console.log(topicId);
  useEffect(() => {
    if (!forumId || !topicId) return;

    const fetchTopic = async () => {
      try {
        const topicDocRef = doc(db, `Forums/${forumId}/Topics/${topicId}`);
        const topicDoc = await getDoc(topicDocRef);

        if (topicDoc.exists()) {
          setTopic({ id: topicDoc.id, ...topicDoc.data() });
          console.log(topicDoc.data());
        } else {
          console.error("No topic found with this ID");
          console.log("No topic found with this ID");
        }
      } catch (error) {
        console.error("Error fetching topic:", error);
      }
    };

    const fetchComments = async () => {
      try {
        const commentsRef = collection(db, `Forums/${forumId}/Topics/${topicId}/Comments`);
        const querySnapshot = await getDocs(commentsRef);

        const commentsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setComments(commentsData);
      } catch (error) {
        console.error("Error fetching comments:", error);
      }
    };

    fetchTopic();
    fetchComments();
  }, [forumId, topicId, db]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser || null);
    });

    return () => unsubscribe();
  }, [auth]);

  const handleEditClick = () => {
    if (user) {
      setIsEditing(true);
    } else {
      alert("You must be logged in to add a comment.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!auth.currentUser) {
      setError('You must be logged in to add a comment.');
      return;
    }

    try {
      const commentsRef = collection(db, `Forums/${forumId}/Topics/${topicId}/Comments`);
      await addDoc(commentsRef, {
        Content: content,
        AuthorId: auth.currentUser.email,
        CreatedAt: new Date(),
      });

      setContent(''); // Reset du contenu
      setIsEditing(false); // Fermer le formulaire
      setError(''); // Réinitialiser les erreurs

      // Recharger les commentaires
      const querySnapshot = await getDocs(commentsRef);
      const commentsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setComments(commentsData);
    } catch (error) {
      setError('Error adding comment: ' + error.message);
    }
  };

  return (
    <>
      <Headerpublic />
      <div className="container mt-4">
        <div className='row'>
          <div className='col-md-6'>
            <button className="btn btn-primary" onClick={handleEditClick}>
              Add new comment
            </button>
          </div>
          <div className='col-md-6'>
            <div className='col-md-5'>
              <input type="text" className="form-control" placeholder="Search..." />
            </div>
            <div className='col-md-1'>
              <button className="btn btn-primary">Search</button>
            </div>
          </div>
        </div>

        {isEditing && (
          <div className="container mt-4">
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="Content">Comment</label>
                <textarea
                  className="form-control"
                  id="content"
                  value={content}
                  onChange={(event) => setContent(event.target.value)}
                />
              </div>
              <button type="submit" className="btn btn-primary">
                Add
              </button>
            </form>
            {error && <div className="alert alert-danger mt-3">{error}</div>}
          </div>
        )}

        <div className="container mt-4">
          <h1>Topic: {topic?.Title || "Loading..."}</h1>
          <p>{topic?.Content}</p>
          <h2>Comments:</h2>
          <ul>
            {comments.map((comment) => (
              <li key={comment.id}>
                <strong>{comment.AuthorId}</strong>: {comment.Content}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}
