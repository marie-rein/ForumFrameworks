"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import init from "../common/init";
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from "firebase/auth";
import { getStorage, ref, listAll, getDownloadURL, getMetadata } from "firebase/storage";

function Headerpublic() {
  const { auth } = init();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(null); // Utilisateur connecté
  const [imageFiles, setImageFiles] = useState([]);
  const storage = getStorage();

  // État pour le message dans le header
  const [etatUser, setEtatUser] = useState("Guest");

  // Vérifier l'état de connexion de l'utilisateur
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setEtatUser("Member");
        setUser(currentUser);
      } else {
        setEtatUser("Guest");
        setUser(null);
      }
    });

    // Nettoyage de l'abonnement
    return () => unsubscribe();
  }, [auth]);

  // Récupérer l'image de profil de l'utilisateur
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
        console.log("No profile pictures found.");
      }
    } catch (error) {
      console.error("Error fetching profile pictures:", error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchProfilePictures(user);
    }
  }, [user]);

  // Gestion de la déconnexion
  const logOut = (e) => {
    e.preventDefault();
    signOut(auth)
      .then(() => {
        console.log("Logged out");
        router.push("/");
      })
      .catch((error) => {
        console.error("Error logging out:", error.message);
      });
  };

  // Gestion de la connexion
  const submitForm = (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;

    signInWithEmailAndPassword(auth, email, password)
      .then((userCred) => {
        console.log("Utilisateur connecté :", userCred.user);
      })
      .catch((error) => {
        alert("User does not exist, Please create an account");
        router.push("../inscription");
        console.error("Erreur :", error.message);
      });
  };

  return (
    <header>
      <div className="container-fluid">
        <nav className="row align-items-center navbar navbar-expand-lg navbar-dark">
          <button
            className="col-6 navbar-toggler"
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className={`contenuLambda col-6 col-lg-9 align-items-center collapse navbar-collapse ${menuOpen ? 'show' : ''}`} id="navbarNav ">
            <nav className="navbar navbar-default navbar-doublerow navbar-trans">
              <div className="navbar navbar-down">
                <div className="container">
                  <div className="flex-container">
                    <div className="navbar-header flex-item">
                      <a className="navbar-brand" href="#">
                        <img src="/images/LogoFWF.png" alt="Logo" height={110} width={110} />
                      </a>
                    </div>
                    <ul className="nav navbar-nav flex-item hidden-xs text-center justify-content-center">
                      <li><a href="/">Home</a></li>
                      <li><a href="#">About</a></li>
                      <li><a href="#">Contact</a></li>
                      <li><a href="#">FAQ</a></li>
                    </ul>
                    <h2>Welcome {etatUser}</h2>
                  </div>
                </div>
              </div>

              <div className="navbar navbar-top">
                <div className="container">
                  {etatUser === "Guest" ? (
                    <form onSubmit={submitForm}>
                      <div className="pull-right navbar-form">
                        <input
                          type="email"
                          className="form-control input-sm"
                          name="email"
                          placeholder="Enter your email"
                          required
                          style={{ marginRight: "5px" }}
                        />
                        <input
                          type="password"
                          className="form-control input-sm"
                          name="password"
                          placeholder="Enter your password"
                          required
                          style={{ marginRight: "5px" }}
                        />
                        <button type="submit" className="btn btn-sm btn-success">
                          <span className="glyphicon glyphicon-user"></span> Login
                        </button>
                       
                          <a href="../inscription" className="btn btn-sm btn-primary" style={{ marginLeft: "5px" }}>
                            <span className="glyphicon glyphicon-certificate"></span> Register
                          </a>
                   
                      </div>
                    </form>
                  ) : (
                    <>
                      {user && (
                        <Link href={`../Profil/${user.uid}`}>
                          <img
                           src={imageFiles.length > 0? imageFiles[0] : "/images/profiledefault.jpg"}                   
                            alt="User Profile"   
                            id="logoConnexion"                
                            className="rounded-circle"
                            width={70}
                            height={70}
                          />
                        </Link>
                          

                      )
                      }
      
                      <button className="btn btn-danger" onClick={logOut}>
                        Log Out
                      </button>
                    </>
                  )}
                </div>
              </div>
            </nav>
          </div>
        </nav>
      </div>
    </header>
  );
}

export default Headerpublic;
