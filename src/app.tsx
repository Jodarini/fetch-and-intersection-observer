import { ChangeEvent, useEffect, useRef, useState } from "react"
import Header from "./header"

interface Users {
  firstName: string
  lastName: string
  email: string
  phone: string
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
    <div className="h-full w-full">
      <Header />
      <form className="w-full p-4 sticky top-0 bg-slate-800">
        <input className="w-full rounded-3xl bg-slate-700/50 p-2" type="text" placeholder=" search..." onChange={handleOnChange} value={searchValue} />
      </form>
      <div className="flex flex-col">
        {searchValue}
        {
          users?.map((user) => (
            <div key={user.id} className="flex w-full border-t border-t-gray-700 bg-gray-900/10 p-4">
              <div className="flex flex-row gap-1">
                <img className="size-24" src={user.image}></img>
                <div className="flex flex-col break-all">
                  <p>{user.firstName} {user.lastName}</p>
                  <p>{user.phone}</p>
                  <p>{user.email}</p>
                </div>
              </div>
            </div>
          ))
        }
        <span ref={observedRef as any}>end of userList</span>

      </div>
    </div>
  )
}
