"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import init from '../common/init';
import { createUserWithEmailAndPassword } from "firebase/auth";
// import ErrorModal from '../Components/modal';
import { getStorage, ref, uploadBytes } from "firebase/storage";
import Headerpublic from '../Components/headerpublic';


export function Inscription() {
  const { auth } = init();
  const router = useRouter();
//   const [showModal, setShowModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const storage = getStorage();

  // Appelé lorsqu'on envoie le formulaire
  async function submitForm(e) {
    e.preventDefault();

    // Récupération des champs du formulaire
    const email = e.target.email.value;
    const password = e.target.password.value;
    const image = e.target.image.files[0];

    try {
      // Ajout de l'utilisateur (courriel + mot de passe)
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      const userId = userCred.user.uid;

      // Préparer la référence pour l'image
      const refFile = ref(storage, `${userId}/ProfilePicture/${image.name}`);

      // Télécharger l'image
      await uploadBytes(refFile, image);
      console.log('Uploaded a blob or file!');

      // Rediriger l'utilisateur après la création
      router.push('../accueil');
    } catch (error) {
    //   setErrorMessage("Email address already exists or/and password must be at least 8 characters long"); // Set error message
    //   setShowModal(true); // Show error modal
      console.log(error.message);
    }
  }

  return (<>
    <Headerpublic/>
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card border-0 bg-light shadow">
            <div className="card-body p-5">
              <h2 className="card-title text-center mb-4">Create an Account FrameWorksFlow</h2>
              <form onSubmit={submitForm}>
                <div className="form-group">
                  <label htmlFor="email">Email *</label>
                  <input 
                    type="email" 
                    className="form-control" 
                    name="email" 
                    placeholder="Enter your email" 
                    required
                  />
                </div>
                <br />
                <div className="form-group">
                  <label htmlFor="password">Password *</label>
                  <input 
                    type="password" 
                    className="form-control" 
                    name="password" 
                    placeholder="Enter your password" 
                    required minLength="8"
                  />
                  <small className="form-text text-danger">Your password must be at least 8 characters long.</small>
                </div>
                <br />
                <div className="form-group">
                  <label htmlFor='image'>Image Profil*</label>
                  <input
                    type="file"
                    className="form-control"
                    name="image"
                    required
                  />
                </div>
                <br />
                <button type="submit" className="btn btn-danger btn-block">Save</button>
              </form>
            </div>
          </div>
        </div>
      </div>
      {/* <ErrorModal
        show={showModal}
        onHide={() => setShowModal(false)}
        message={errorMessage}
      /> */}
    </div>

    </>

  );
}

export default Inscription;
