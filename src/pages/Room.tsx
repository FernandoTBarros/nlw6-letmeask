import { Button } from "../components/Button";
import logoImg from '../assets/images/logo.svg'

import '../styles/room.scss'
import { RoomCode } from "../components/RoomCode";
import { useParams } from "react-router-dom";
import { FormEvent, useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { database } from "../services/firebase";

type RoomParams = {
  id: string;
}

type FirebaseQuestions = Record<string, {
  author: {
    name: string;
    avatar: string;
  }
  content: string;
  isHighlighted: boolean;
  isAnswered: boolean;
}>

type Question = {
  id: string,
  author: {
    name: string;
    avatar: string;
  }
  content: string;
  isHighlighted: boolean;
  isAnswered: boolean;
}

export function Room() {
  const { id: roomId } = useParams<RoomParams>();
  const { user, signInWithGoogle } = useAuth();
  // const history = useHistory();
  const [newQuestion, setNewQuestion] = useState('');
  const [title, setTitle] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);

  // useEffect(() => {
  //   if (!user) {
  //     history.push('/');
  //   }
  // }, [user, history])

  useEffect(() => {
    const roomRef = database.ref(`rooms/${roomId}`);

    roomRef.on('value', room => {
      const dbRoom = room.val();
      const firebaseQuestions: FirebaseQuestions = dbRoom.questions ?? {};
      const parsedQuestions = Object.entries(firebaseQuestions).map(([key, value]) => {
        return {
          id: key,
          content: value.content,
          author: value.author,
          isHighlighted: value.isHighlighted,
          isAnswered: value.isAnswered,
        }
      });

      setTitle(dbRoom.title);
      setQuestions(parsedQuestions);
    })
  }, [roomId])

  async function handleSendQuestion(event: FormEvent) {
    event.preventDefault();
    if (newQuestion.trim() === '') {
      return;
    }

    if (!user) {
      throw new Error('You must be logged in');
    }

    const question = {
      content: newQuestion,
      author: {
        name: user.name,
        avatar: user.avatar,
      },
      isHighlighted: false,
      isAnswered: false
    }

    await database.ref(`rooms/${roomId}/questions`).push(question)

    setNewQuestion('');
  }
  return (
    <div id="page-room">
      <header>
        <div className="content">
          <img src={logoImg} alt="Letmeask" />
          <RoomCode code={roomId} />
        </div>
      </header>

      <main>
        <div className="room-title">
          <h1>Sala {title}</h1>
          {questions.length > 0 && <span>{questions.length} pergunta(s)</span>}
        </div>

        <form onSubmit={handleSendQuestion}>
          <textarea value={newQuestion} onChange={event => setNewQuestion(event.target.value)} placeholder="O que você quer perguntar?" />
          <div className="form-footer">
            {user ? (
              <div className="user-info">
                <img src={user.avatar} alt={user.name} />
                <span>{user.name}</span>
              </div>
            ) : (
              <span>Para enviar uma pergunta, <button onClick={signInWithGoogle}>faça seu login</button>.</span>
            )}
            <Button type="submit" disabled={!user}>Enviar pergunta</Button>
          </div>
        </form>
        {JSON.stringify(questions)}
      </main>
    </div >
  );
}