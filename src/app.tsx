import { ChangeEvent, useEffect, useRef, useState } from "react"

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
  const [searchValue, setSearchValue] = useState('')

  const intersectionCallback = (entries: IntersectionObserverEntry[]) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && hasMore) {
        loadMoreUsers(searchValue)
      }
    });
  }

  useEffect(() => {
    let observer = new IntersectionObserver(intersectionCallback);
    if (observedRef.current && hasMore) {
      observer.observe(observedRef.current)
    }
    return () => {
      observer.disconnect()
    }
  }, [users])

  useEffect(() => {
    loadMoreUsers(searchValue)
    setHasMore(true)
  }, [searchValue])

  const loadMoreUsers = async (value: string) => {
    if (value === undefined) value = ''
    const res = await fetch(`http://dummyjson.com/users/search?q=${value}&limit=10&skip=${skip}`)
    const data = await res.json()
    if (data.users.length === 0) {
      setHasMore(false)
    } else {

      setSkip(prev => prev += data.users.length)
      if (skip === 0) {
        setUsers(data.users)
      } else {
        setUsers(prevUsers => [...prevUsers, ...data.users])
      }
    }
  }

  const handleOnChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSkip(0)
    setSearchValue(e.target.value)
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-3xl">app</h1>
      <form>
        <input type="text" placeholder=" search..." onChange={handleOnChange} value={searchValue} />
      </form>
      {searchValue}
      {
        users?.map((user) => (
          <div key={user.id}>
            <p>{user.firstName}</p>
            <p>{user.lastName}</p>
            <img src={user.image}></img>
          </div>
        ))
      }
      <span ref={observedRef as any}>end of userList</span>

    </div>
  )
}
