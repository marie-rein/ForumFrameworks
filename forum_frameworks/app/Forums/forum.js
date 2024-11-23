import 'bootstrap/dist/css/bootstrap.min.css';
import init from '../common/init';
import { collection, query, where, getDocs } from "firebase/firestore";
import {useState, useEffect} from 'react';

export default function ForumPage() {
    const [data, setData] = useState([]);

    try {
    useEffect(() => {
        const { db } = init();

        const fetchData = async () => {
            const q = query(collection(db, "GeneralTheme"));
            const querySnapshot = await getDocs(q);
            const data = querySnapshot.docs.map((doc) => doc.data());
            console.log(data);
            setData(data);

        };

        fetchData();
    }, []);
    } catch (error) {
        console.log(error);
    }




  return (
    <div className="container mt-4">
      <table className="table table-striped table-hover">
        <thead className="thead-dark">
          <tr>
            <th>Sujet</th>
            <th>Description</th>
            <th>Topics</th>
            <th>Posts</th>
            <th>Dernier post</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index}>
              <td>{item.Name}</td>
              <td>{item.Description}</td>
              <td>{item.DateCreation}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
