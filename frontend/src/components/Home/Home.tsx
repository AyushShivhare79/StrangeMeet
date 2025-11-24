import { Button } from '../ui/button'
import { Link } from 'react-router'

export default function Home() {
  return (
    <div className="flex justify-center items-center h-screen border">
      <Button asChild>
        <Link to="/video">Start Video Chat</Link>
      </Button>
    </div>
  )
}
