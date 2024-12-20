"use client";
import 'bootstrap/dist/css/bootstrap.min.css';
import init from '../../../common/init';
import { getStorage, ref, listAll, getDownloadURL, getMetadata } from "firebase/storage";
import { collection, doc, getDocs, getDoc, addDoc, deleteDoc, updateDoc, where,query } from "firebase/firestore";
import { useState, useEffect } from 'react';
import Headerpublic from '@/app/Components/headerpublic';
import { useParams } from 'next/navigation';
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function TopicContent() {
  const [topic, setTopic] = useState(null);
  const [comments, setComments] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [content, setContent] = useState('');
  const [imageFiles, setImageFiles] = useState([]);
  const router = useRouter();

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
   // Convertir Timestamp en date lisible
   const formatTimestamp = (timestamp) => {
    if (!timestamp) return "";
    const date = timestamp.toDate();
    return date.toLocaleString();
  };

  const getUserDocumentByUserId = async (db, userId) => {
    try {
      // Création d une requête pour rechercher le document dont le champ UserId correspond à userId
      const usersCollectionRef = collection(db, "Users");
      const q = query(usersCollectionRef, where("UserId", "==", userId));
  
      
      const querySnapshot = await getDocs(q);
  
      if (querySnapshot.empty) {
        console.error("No user document found with the specified UserId.");
        return null; 
      }
  
      // Retourne le premier document trouvé
      const userDoc = querySnapshot.docs[0]; 
      return { id: userDoc.id, ...userDoc.data() };
    } catch (error) {
      console.error("Error fetching user document:", error);
      return null;
    }
  };
  const updatePublicationCount = async (userId, increment) => {
    try {
      // Récupération du document utilisateur par UserId
      const userDoc = await getUserDocumentByUserId(db, userId);
      
      if (!userDoc) {
        console.error("User not found.");
        return;
      }
  
      // Récupérer la valeur actuelle de NbrePublication
      const currentCount = userDoc.NbrePublication || 0;
  
      // Calcul de la nouvelle valeur
      const newCount = increment ? currentCount + 1 : Math.max(0, currentCount - 1);
  
      // Référence vers le document utilisateur
      const userDocRef = doc(db, "Users", userDoc.id);
  
      // Mettre à jour la valeur de NbrePublication dans Firestore
      await updateDoc(userDocRef, { NbrePublication: newCount });
  
      console.log(`NbrePublication updated to ${newCount}`);

    } catch (error) {
      console.error("Error updating NbrePublication:", error);
    }
  };
  
  //Fonction permettant la mise à jour du nombre de commentaires
  const updateCommentCount = async (increment) => {
    if (!auth.currentUser) {
      console.error("User is not authenticated.");
      return;
    }
  
    try {
      const topicDocRef = doc(db, `Forums/${forumId}/Topics/${topicId}`);
      const topicDoc = await getDoc(topicDocRef);
  
      if (!topicDoc.exists()) {
        console.error("Topic not found.");
        return;
      }
  
      const currentCommentCount = topicDoc.data().CommentCount || 0;
      const newCommentCount = increment
        ? currentCommentCount + 1
        : Math.max(0, currentCommentCount - 1);
  
      console.log("Attempting to update CommentCount to:", newCommentCount);
  
      await updateDoc(topicDocRef, {
        CommentCount: newCommentCount, // Seul champ modifié
      });
  
      console.log(`CommentCount updated to ${newCommentCount}`);
    } catch (error) {
      console.error("Error updating CommentCount:", error);
    }
  };
  
  
  const handleDelete = async (commentId) => {
    if (!commentId) return;
  
    // Vérifier si l'utilisateur est connecté
    if (!auth.currentUser) {
      alert("You must be logged in to delete a comment.");
      return;
    }
  
    const currentUserEmail = auth.currentUser.email;
  
    // Demander une confirmation
    const isConfirmed = window.confirm("Are you sure you want to delete this comment?");
    if (!isConfirmed) return;
  
    try {
      // Référence du document Firestore
      const commentDocRef = doc(db, `Forums/${forumId}/Topics/${topicId}/Comments/${commentId}`);
  
      // Récupérer les données du topic
      const commentDoc = await getDoc(commentDocRef);
      if (!commentDoc.exists()) {
        alert("Comment not found.");
        return;
      }
  
      const commentData = commentDoc.data();
      
      // Vérifier que l'utilisateur est bien l'auteur
      if (commentData.AuthorId.trim() !== currentUserEmail.trim()) {
       
        alert("You do not have permission to delete this comment.");
        return;
      }
      
  
      // Supprimer le topic
      await deleteDoc(commentDocRef);
  
      // Mettre à jour la liste des topics automatiquement
      setComments ((prevComments) => prevComments.filter((comment) => comment.id !== commentId));
  
      alert("Comment deleted successfully.");
      // decrementer le nombre de commentaires
      updateCommentCount(false);
      await updatePublicationCount(auth.currentUser.uid, false);
    } catch (error) {
      console.error("Error deleting comment:", error);
  
      if (error.code === "permission-denied") {
        alert("You do not have permission to delete this comment.");
      } else {
        alert("Failed to delete comment. Please try again.");
      }
    }
  };

  const handleEditClick = () => {
    if (user) {
      setIsEditing(true);
    } else {
      alert("You must be logged in to add a comment.");
    }
  };


  //envoyer une notification aux utilisateurs abonnées au topic

  async function send() {
    const message = user ? `${user.email} a commenté votre topic` : "Utilisateur non connecté";
      const response = await fetch('/api/send-message', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({
          
              message: message,
              userEmail: user.email
          })
      });
     if(response.ok) {
      alert( `Le message a bien été envoyé par ${user.email} et le contenu est ${message}`);
     }
  }
  // Fonction de soumission du formulaire des commentaires
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!auth.currentUser) {
      setError('You must be logged in to add a comment.');
      return;
    }

    try {
      const commentsRef = collection(db, `Forums/${forumId}/Topics/${topicId}/Comments`);
      const userDoc = await getUserDocumentByUserId(db, auth.currentUser.uid);
      await addDoc(commentsRef, {
        Content: content,
        AuthorId: auth.currentUser.email,
        CreateAuthor: userDoc.DateCreateAccount,
        NbrePublicationAuthor: userDoc.NbrePublication,
        CreatedAt: new Date(),
        URLProfile: userDoc.ProfilePicture
      });

      await send();
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

      updateCommentCount(true);
      await updatePublicationCount(auth.currentUser.uid, true);

    } catch (error) {
      setError('Error adding comment: ' + error.message);
    }
  };

  

  return (
<>
      <Headerpublic />
      <button
        className="btn btn-professional"
        onClick={() => router.back()} >
        <span className="icon">←</span> Return to topics
      </button>
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
            <button type="submit" className="btn btn-primary">
              Add
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => setIsEditing(false)}>
              Cancel
            </button>
          </form>
        )}
        {error && <div className="alert alert-danger mt-3">{error}</div>}
        <h1>Topic: {topic?.Title || "Loading..."}</h1>
        <p>{topic?.Content}</p>
        <h2>Comments:</h2>
        <ul className="list-unstyled">
          {comments.map((comment, index) => (
            <li key={index} className="border-bottom py-3">
              <div className="d-flex align-items-center">
                <img
                  src={comment.URLProfile || "/images/profiledefault.jpg"}
                  alt="Profile"
                  className="rounded-circle me-3"
                  width={40}
                  height={40}
                />
                <div>
                  <strong>{comment.AuthorId}</strong> Member since <strong>{formatTimestamp(comment.CreateAuthor)}</strong> Total publications: <strong>{comment.NbrePublicationAuthor}</strong> 
                  <p>{comment.Content}</p>
                  <p className="text-muted">
                    <small>Posted on {formatTimestamp(comment.CreatedAt)}</small>
                  </p>
                  {user?.email === comment.AuthorId && (
                    <button onClick={() => handleDelete(comment.id)} className="btn btn-danger btn-sm">
                      <img
                        src="/images/recycle.png"
                        alt="Delete"
                        style={{ width: "16px", height: "16px" }}
                      />
                    </button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
