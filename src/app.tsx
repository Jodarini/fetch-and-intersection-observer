import { useEffect, useRef, useState } from "react"

interface Users {
  firstName: string
  lastName: string
  id: number
  image: string
}

export default function app() {
  const [users, setUsers] = useState<Users[]>([])
  const observedRef = useRef()
  const [skip, setSkip] = useState(0)
  const [hasMore, setHasMore] = useState(true)

  const intersectionCallback = (entries: IntersectionObserverEntry[]) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        getUsers()
      }
    });
  }

  useEffect(() => {
    let observer = new IntersectionObserver(intersectionCallback);
    if (observedRef.current) {
      observer.observe(observedRef.current)
    }

    return () => {
      observer.disconnect()
    }
  }, [users])

  const getUsers = async () => {
    const res = await fetch(`http://dummyjson.com/users?&limit=10&skip=${skip * 10}`)
    const data = await res.json()
    if (data.users.length === 0) {
      setHasMore(false)
    } else {
      setUsers(prevUsers => [...prevUsers, ...data.users])
      setSkip(prev => prev + 1)
    }

  }


  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-3xl">app</h1>
      {
        users?.map((user) => (
          <div key={user.id}>
            <p>{user.firstName}</p>
            <p>{user.lastName}</p>
            <img src={user.image}></img>
          </div>
        ))
      }
      {hasMore &&
        <p ref={observedRef}>Loading more...</p>
      }
    </div>
  )
}

