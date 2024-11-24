import 'bootstrap/dist/css/bootstrap.min.css';
import init from '../common/init';
import { collection, query, getDocs } from "firebase/firestore";
import { useState, useEffect } from 'react';
import Link from "next/link";

export default function ForumPage() {
  const [data, setData] = useState([]); // Stockage des forums

  useEffect(() => {
    const { db } = init(); // Initialisation de Firebase

    const fetchData = async () => {
      try {
        const q = query(collection(db, "Forums")); // Collection "Forums"
        const querySnapshot = await getDocs(q);

        // Inclure l'ID du document dans les données
        const forums = querySnapshot.docs.map((doc) => ({
          id: doc.id, // ID du document Firestore
          ...doc.data(), // Autres données du document
        }));

        console.log(forums); // Pour debug
        setData(forums); // Mise à jour de l'état
      } catch (error) {
        console.error("Erreur lors de la récupération des forums :", error);
      }
    };

    fetchData();
  }, []);


  return (
    <div className="container mt-4">
      <table className="table table-striped table-hover">
        <thead className="thead-dark">
          <tr>
            <th>Forum</th>
            <th>Description</th>
            <th>Topics</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index}>
               <td>
               <Link href={`/Topics/${item.id}`}>
                    {item.Name}
                </Link>
            </td>
              <td>{item.Description}</td>
              <td>{item.TopicCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
