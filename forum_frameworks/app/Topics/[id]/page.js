"use client";
import 'bootstrap/dist/css/bootstrap.min.css';
import init from '../../common/init';
import { collection, query, getDocs } from "firebase/firestore";
import { useState, useEffect } from 'react';
import Headerpublic from '@/app/Components/headerpublic';
import Link from 'next/link';

export default function TopicsPage({ params }) {
  const [topics, setTopics] = useState([]);
  //const [loading, setLoading] = useState(true);
  const { id } = params;

  useEffect(() => {
    if (!id) return;

    const { db } = init();

    const fetchTopics = async () => {
      try {
        const q = query(collection(db, `Forums/${id}/Topics`));
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
  }, [id]); 

  // if (loading) {
  //   return <div className="container mt-4">Chargement des topics...</div>;
  // }

  return (
    <>
   
    <Headerpublic />
    <div className="container mt-4">
      <div className='row'>
        <div className='col-md-6'>
          <Link href="../../AddTopics" className="btn btn-primary">
            <button className="btn btn-primary">Add New Topic</button>
          </Link>
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
      </div>
    <div className="container mt-4">
      <h1>Topics pour le forum {id}</h1>
      <table className="table table-striped table-hover">
        <thead>
          <tr>
            <th>Title</th>
            <th>Content</th>
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
                <td>{topic.Title}</td>
                <td>{topic.Content}</td>
                <td>{topic.CreatedAt}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
    </>
  );
 
}
