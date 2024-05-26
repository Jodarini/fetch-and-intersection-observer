import { ChangeEventHandler, FormEvent, FormEventHandler, useEffect, useRef, useState } from "react"

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
  const [searchValue, setSearchValue] = useState()

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

  const searchUsers = async () => {
    const res = await fetch(`http://dummyjson.com/users/search?q=${searchValue}`)
    const data = await res.json()
    if (data.users.length === 0) {
      setHasMore(false)
    } else {
      setUsers(data.users)
      setSkip(prev => prev + 1)
    }
  }

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    searchUsers()
  }
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-3xl">app</h1>
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder=" search..." onChange={e => setSearchValue(e.target.value)} name={searchValue} />
      </form>

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
        <div ref={observedRef as any}>Loading more...</div>
      }
    </div>
  )
}
