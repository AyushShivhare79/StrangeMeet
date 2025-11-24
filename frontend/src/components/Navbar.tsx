import { Button } from './ui/button'

export default function Navbar() {
  return (
    <div className="flex border border-black rounded-xl w-full justify-between items-center px-4 py-2 mb-4">
      <h2 className="text-xl font-bold">Strange Meet</h2>
      <div className="flex items-center gap-4">
        <h1 className="font-medium font-serif">Online 5</h1>
        <Button className="p-5">SignIn</Button>
      </div>
    </div>
  )
}
