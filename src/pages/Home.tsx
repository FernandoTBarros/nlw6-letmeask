import { useHistory } from 'react-router';
import { useAuth } from '../hooks/useAuth';

import illustrationImg from '../assets/images/illustration.svg';
import logoImg from '../assets/images/logo.svg'
import googleIconImg from '../assets/images/google-icon.svg'

import { Button } from '../components/Button';

import '../styles/auth.scss'
import { FormEvent, useState } from 'react';
import { database } from '../services/firebase';
import { useTheme } from '../hooks/useTheme';

export function Home() {
  const history = useHistory();
  const { user, signInWithGoogle, signOut } = useAuth();
  const [roomCode, setRoomCode] = useState('');

  const { theme, toggleTheme } = useTheme();
  async function handleCreateRoom() {
    if (!user) {
      await signInWithGoogle();
    }

    history.push('/rooms/new');
  }

  async function handleJoinRoom(event: FormEvent) {
    event.preventDefault();

    if (roomCode.trim() === '') {
      return;
    }

    const roomRef = await database.ref(`rooms/${roomCode}`).get();

    if (!roomRef.exists()) {
      alert('Room does not exists');
    }

    if (roomRef.val().endedAt) {
      alert('Room already ended');
      return;
    }

    history.push(`rooms/${roomCode}`)
  }

  async function handleSignOut() {
    await signOut();
  }

  return (
    <div id="page-auth">
      <aside>
        <img src={illustrationImg} alt="Ilustração simbolizando perguntas e respostas" />
        <strong>Crie salas de Q&amp;A ao-vivo</strong>
        <p>Tire as dúvidas da sua audiência em tempo-real</p>
      </aside>
      <main>
        <div className="main-content">
          <h1>{theme}</h1>
          <button onClick={toggleTheme}>Toggle</button>
          <img src={logoImg} alt="Letmeask" />
          <button className="create-room" onClick={handleCreateRoom}>
            <img src={googleIconImg} alt="Logo do Google" />
            Crie sua sala com o Google
          </button>
          <div className="separator">ou entre em uma sala</div>
          <form onSubmit={handleJoinRoom}>
            <input type="text" placeholder="Digite o código da sala"
              value={roomCode} onChange={event => setRoomCode(event.target.value)} />
            <Button type="submit">Entrar na sala</Button>
          </form>
          {user && <button onClick={handleSignOut}>Logout</button>}
        </div>
      </main>
    </div>
  );
}