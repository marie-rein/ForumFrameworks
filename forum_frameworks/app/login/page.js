"use client";
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import init from '../common/init'; // Import auth from the updated file
import { signInWithEmailAndPassword } from 'firebase/auth';

export function Login() {
  const {auth} = init()
  const router = useRouter();
  //Appelé lorsqu'on envoie le formulaire
  function submitForm(e){
    e.preventDefault()

    //Récupération des champs du formulaire
    const email = e.target.email.value
    const password = e.target.password.value

    //Connexion (courriel + mot de passe) 
    signInWithEmailAndPassword(auth, email, password)
      .then((userCred) => {
        console.log(userCred.user)
        router.push('../accueil');
      })
      .catch((error) => {
        alert("Utilisateur n'existe pas. Veillez créer un compte");
        router.push('../inscription');
        console.log(error.message)
      })
  }

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card border-0 bg-light shadow">
            <div className="card-body p-5">
              <h2 className="card-title text-center mb-4">Welcome to ToDoList </h2>
              <p>Don't have an account?  
                <Link href="/inscription" passHref>
                 Sign Up
                </Link>
              </p>
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
                  />
                </div>
                <br />
                <button type="submit" className="btn btn-primary btn-block">Login</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
