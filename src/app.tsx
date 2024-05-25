import { useEffect, useState } from "react"

interface User {
  firstName: string
  lastName: string
  id: number
  image: string
}

export default function app() {
  const [users, setUsers] = useState<User[]>()

  useEffect(() => {
    const getUsers = async () => {
      const res = await fetch('http://dummyjson.com/users?&limit=10')
      const data = await res.json()
      setUsers(data.users)
    }
    getUsers()
  }, [])
  return (
    <div className="flex flex-row">
      <h1 className="text-purple-700 text-3xl">app</h1>
      {
        users?.map((user) => (
          <div key={user.id}>
            <p>{user.firstName}</p>
            <p>{user.lastName}</p>
            <img src={user.image}></img>
          </div>
        ))
      }
    </div>
  )
}

