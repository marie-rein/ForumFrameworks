"use client";
import 'bootstrap/dist/css/bootstrap.min.css';
import init from '../../common/init';
import { collection, query, getDocs, addDoc } from "firebase/firestore";
import { useState, useEffect } from 'react';
import Headerpublic from '@/app/Components/headerpublic';
import { useParams } from 'next/navigation';
import { onAuthStateChanged } from "firebase/auth";
import Link from "next/link";
export default function TopicsPage() {
  const [topics, setTopics] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  //const [loading, setLoading] = useState(true);
  const params = useParams();
  const { auth, db } = init();

  useEffect(() => {
    if (!params.id) return;

    //const { db } = init();

    const fetchTopics = async () => {
      try {
        const q = query(collection(db, `Forums/${params.id}/Topics`));
        const querySnapshot = await getDocs(q);

        const topicsData = querySnapshot.docs.map((doc) => ({
          id: doc.id, // Inclure l'ID du topic
          ...doc.data(),
        }));

        setTopics(topicsData);
        //setLoading(false);
      } catch (error) {
        console.error("Erreur lors de la récupération des topics :", error);
        //setLoading(false);
      }
    };

    fetchTopics();
  }, [params.id]); 

  // if (loading) {
  //   return <div className="container mt-4">Chargement des topics...</div>;
  // }

  //Add new topic logic

  useEffect(() => {

    // Surveiller les changements d'état d'authentification
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        if (currentUser) {
            setUser(currentUser);
        } else {
            // affiche une alerte si l'utilisateur n'est pas connecté
            setIsEditing(false);
            console.log('You must be logged in to add a topic.'); 
        }
    });

    return () => unsubscribe(); // Nettoyage lors de la fin de l'utilisation
}, [auth]);
const handleEditClick = () => {
  if (user) {
    setIsEditing(true);
    console.log("User is logged in. Editing mode enabled.");
  } else {
    setIsEditing(false);
    alert("You must be logged in to add a topic.");
    console.log("You must be logged in to add a topic.");
  }
};
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!auth.currentUser) {
        setError('You must be logged in to add a topic.');
        return;
    }

    const currentUser = auth.currentUser;

    try {
        // Créer une référence vers la collection 'Topics' dans Firebase
        const TopicDocRef = collection(db, `Forums/${params.id}/Topics`);
        
        // Ajouter un nouveau topic dans la collection
        await addDoc(TopicDocRef, {
            Title: title,
            Content: content,
            AuthorId: currentUser.email,
            CreatedAt: new Date(),
            CommentCount: 0
            // Optionnel : Vous pouvez ajouter d'autres champs ici, comme UpdatedAt, Replies, etc.
        });

       //fermer le formulaire
        setIsEditing(false);

        // Rediriger vers la page du topic nouvellement crian
       // router.push(`/Forums/${currentUser.uid}/Topics/${docRef.id}`);
    } catch (error) {
        setError('Error adding topic: ' + error.message);
    }
};

  return (
    <>
   
    <Headerpublic />
    <div className="container mt-4">
      <div className='row'>
        <div className='col-md-6'>
        <button className="btn btn-primary" onClick={handleEditClick}>
        Add new topic
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
               <label htmlFor="Title">Titre</label>
               <input
                   type="text"
                   className="form-control"
                   id="title"
                   value={title}
                   onChange={(event) => setTitle(event.target.value)}
               />
           </div>
           <div className="form-group">
               <label htmlFor="Content">Contenu</label>
               <textarea
                   className="form-control"
                   id="content"
                   value={content}
                   onChange={(event) => setContent(event.target.value)}
               />
           </div>
           <button type="submit" className="btn btn-primary">
            Add topic
           </button>
       </form>
       {error && <div className="alert alert-danger mt-3">{error}</div>}
   </div>
         )}



      </div>
    <div className="container mt-4">
      <h1>Topics forforum {params.id}</h1>
      <table className="table table-striped table-hover">
        <thead>
          <tr>
            <th>Topics</th>
            <th>Author</th>
            <th>Comments</th>
            <th>Created At</th>
          </tr>
        </thead>
        <tbody>
          {topics.length === 0 ? (
            <tr>
              <td colSpan="3" className="text-center">Aucun topic disponible</td>
            </tr>
          ) : (
            topics.map((topic, index) => (
              <tr key={index}>
                <td>
                  <Link href={`/TopicContent/${params.id}/${topic.id}`}>{topic.Title} </Link>
                </td>
                <td>{topic.AuthorId}</td>            
                <td>{topic.CommentCount}</td>
                <td>{topic.CreatedAt && topic.CreatedAt.toDate
                  ? topic.CreatedAt.toDate().toLocaleString() // Convertir Timestamp en chaîne lisible
                  : topic.CreatedAt}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      
    </div>
    </>
  );
 
}
