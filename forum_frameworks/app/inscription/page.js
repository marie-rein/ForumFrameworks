"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import init from "../common/init";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import Headerpublic from "../Components/headerpublic";

export default function Inscription() {
  const { auth, db} = init();
  const router = useRouter();
  const storage = getStorage();

  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Appelé lorsqu'on envoie le formulaire
  async function submitForm(e) {
    e.preventDefault();
    setErrorMessage(null); // Réinitialiser les messages d'erreur
    setSuccessMessage(null);

    // Récupération des champs du formulaire
    const email = e.target.email.value;
    const password = e.target.password.value;
    const image = e.target.image.files[0];

    if (!image) {
      setErrorMessage("Please select a profile picture.");
      return;
    }

    try {
      // Création de l'utilisateur
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      const userId = userCred.user.uid;

      // Téléchargement de l'image
      const imageRef = ref(storage, `${userId}/ProfilePicture/${image.name}`);
      await uploadBytes(imageRef, image);
      const imageUrl = await getDownloadURL(imageRef);

      // Enregistrement des données de l'utilisateur dans Firestore
      await addDoc(collection(db, "Users"), {
        Email: email,
        DateCreateAccount: serverTimestamp(),
        ProfilePicture: imageUrl,
        NbrePublication: 0, // Correction orthographique
        UserId: userId,
      });

      setSuccessMessage("Account created successfully! Redirecting...");
      setTimeout(() => router.push("../"), 2000); // Redirection avec un délai
      console.log("User document successfully created!");
    } catch (error) {
      if (error.code === "auth/email-already-in-use") {
        setErrorMessage("This email is already in use. Please try a different one.");
      } else {
        console.error("Error creating user:", error);
        setErrorMessage("Failed to create user . Please try again.");
      }
    }
  }

  return (
    <>
      <Headerpublic />
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="card border-0 bg-light shadow">
              <div className="card-body p-5">
                <h2 className="card-title text-center mb-4">Create an Account</h2>
                {errorMessage && (
                  <div className="alert alert-danger" role="alert">
                    {errorMessage}
                  </div>
                )}
                {successMessage && (
                  <div className="alert alert-success" role="alert">
                    {successMessage}
                  </div>
                )}
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
                      required
                      minLength="8"
                    />
                    <small className="form-text text-muted">
                      Your password must be at least 8 characters long.
                    </small>
                  </div>
                  <br />
                  <div className="form-group">
                    <label htmlFor="image">Profile Picture *</label>
                    <input type="file" className="form-control" name="image" required />
                  </div>
                  <br />
                  <button type="submit" className="btn btn-danger btn-block">
                    Save
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
