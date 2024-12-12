"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import init from "../common/init";
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from "firebase/auth";
import { getStorage, ref, listAll, getDownloadURL, getMetadata } from "firebase/storage";
import { getToken, onMessage } from "firebase/messaging";
import { FaBell } from 'react-icons/fa';


function Headerpublic() {
  const { auth, messaging } = init();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(null); // Utilisateur connecté
  const [imageFiles, setImageFiles] = useState([]);
  const [notifications, setNotifications] = useState([]); // État pour les notifications
  const [showNotifications, setShowNotifications] = useState(false);
  const storage = getStorage();

  const [etatUser, setEtatUser] = useState("Guest");

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

  const logOut = (e) => {
    e.preventDefault();
    signOut(auth)
      .then(() => {
        router.push("/");
      })
      .catch((error) => {
        console.error("Error logging out:", error.message);
      });
  };

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
      });
  };

  const setup = async () => {
    if (!messaging) {
      console.error("Firebase Messaging n'est pas initialisé correctement.");
      return;
    }

    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.log("L'utilisateur n'a pas donné la permission");
      return;
    }

    const token = await getToken(messaging, {
      vapidKey: "BMwOfky-nh7p7Tra1ybKrg8GV4g77pSWAL1lxgzhW6lgwV_VhHMg4BMwYxJLRicmQGio7e3Xq70w7NVbGLbJCko",
    });

    console.log("Token: " + token);

    await fetch("/api/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, topic: "Commentaires" }),
    });

    onMessage(messaging, (payload) => {
      if (payload.data && payload.data.message && user.email !== payload.data.userEmail) {
        console.log("Notification reçue de : ", payload.data.userEmail);
        console.log("Message: " + payload.data.message);
        const newNotification = {
          message: payload.data.message,
          time: new Date().toLocaleTimeString(),
        };
        setNotifications((prev) => [newNotification, ...prev]); // Ajouter la notification
      }
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
                        <div>
                          <Link href={`../Profil/${user.uid}`}>
                            <img
                              src={imageFiles.length > 0 ? imageFiles[0] : "/images/profiledefault.jpg"}
                              alt="User Profile"
                              id="logoConnexion"
                              className="rounded-circle"
                              width={70}
                              height={70}
                            />
                          </Link>
                          <button
                            className="btn btn-primary"
                            onClick={setup}
                            style={{ marginLeft: "10px" }}
                          >
                            Register to Notifications
                          </button>
                        </div>
                      )}

                      
                            
                      <button className="btn btn-danger" onClick={logOut}>
                        Log Out
                      </button>

                        {/* Notifications Icon */}
                        <div className="notification-section">
                <button onClick={() => setShowNotifications(!showNotifications)}>
                  <FaBell />
                  {notifications.length > 0 && <span>{notifications.length}</span>}
                </button>
                {showNotifications && (
                  <ul>
                    {notifications.map((notif, index) => (
                      <li key={index}>
                        {notif.message} - <small>{notif.time}</small>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
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
