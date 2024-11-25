"use client";
import 'bootstrap/dist/css/bootstrap.min.css';
import init from '../../../common/init';
import { getStorage, ref, listAll, getDownloadURL, getMetadata } from "firebase/storage";
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
  const [imageFiles, setImageFiles] = useState([]);


  const { forumId, topicId } = useParams();
  const { auth, db } = init();
  let storage; // Declare storage variable outside of initialization
  useEffect(() => {
    // Ensure storage is initialized only after Firebase is ready
    storage = getStorage();
  }, []);
  useEffect(() => {
    if (!forumId || !topicId) return;

    const fetchTopic = async () => {
      try {
        const topicDocRef = doc(db, `Forums/${forumId}/Topics/${topicId}`);
        const topicDoc = await getDoc(topicDocRef);

        if (topicDoc.exists()) {
          setTopic({ id: topicDoc.id, ...topicDoc.data() });
        } else {
          console.error("No topic found with this ID");
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

      if (currentUser) {
        fetchProfilePictures(currentUser);
      } else {
        setImageFiles(["/images/profiledefault.jpg"]); // Image par défaut
      }
    });

    return () => unsubscribe();
  }, [auth]);

  const fetchProfilePictures = async (currentUser) => {
    const listRef = ref(storage, `${currentUser.uid}/ProfilePicture`);

    try {
      const res = await listAll(listRef);
      if (res.items.length > 0) {
        const itemsWithMetadata = await Promise.all(
          res.items.map(async (itemRef) => {
            const metadata = await getMetadata(itemRef);
            return { itemRef, timeCreated: metadata.timeCreated };
          })
        );

        itemsWithMetadata.sort((a, b) => new Date(b.timeCreated) - new Date(a.timeCreated));
        const lastImageUrl = await getDownloadURL(itemsWithMetadata[0].itemRef);
        setImageFiles([lastImageUrl]);
      } else {
        setImageFiles(["/images/profiledefault.jpg"]); // Image par défaut
      }
    } catch (error) {
      console.error("Error fetching profile pictures:", error);
      setImageFiles(["/images/profiledefault.jpg"]); // Image par défaut en cas d'erreur
    }
  };

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
        URLProfile: imageFiles.length > 0 ? imageFiles[0] : "/images/profiledefault.jpg",
      });

      setContent('');
      setIsEditing(false);
      setError('');

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
        <button className="btn btn-primary" onClick={handleEditClick}>
          Add new comment
        </button>
        {isEditing && (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="Content">Comment</label>
              <textarea
                className="form-control"
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primary">Add</button>
          </form>
        )}
        {error && <div className="alert alert-danger mt-3">{error}</div>}
        <h1>Topic: {topic?.Title || "Loading..."}</h1>
        <p>{topic?.Content}</p>
        <h2>Comments:</h2>
        <ul>
          {comments.map((comment) => (
            <li key={comment.id}>
              <img
                src={comment.URLProfile || "/images/profiledefault.jpg"}
                alt="Profile"
                className="rounded-circle"
                width={40}
                height={40}
              />
              <strong>{comment.AuthorId}</strong>: {comment.Content}
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
