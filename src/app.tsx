import { ChangeEvent, useEffect, useRef, useState } from "react"
import Header from "./header"
import { useDebouncedCallback } from "use-debounce"

interface Users {
  firstName: string
  lastName: string
  email: string
  phone: string
  id: number
  image: string
}

const URL = 'http://dummyjson.com/users/'

export default function app() {
  const [users, setUsers] = useState<Users[]>([])
  const observedRef = useRef()
  const [skip, setSkip] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [searchValue, setSearchValue] = useState('')
  const [isFetching, setIsFetching] = useState(false)

  const debouncedFetch = useDebouncedCallback((value) => {
    // if (isFetching) return
    // setIsFetching(true)
    fetchUsers(value)
  }, 500
  )
  const intersectionCallback = (entries: IntersectionObserverEntry[]) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && hasMore) {
        debouncedFetch(true)
      }
    });
  }
  let observer = new IntersectionObserver(intersectionCallback);

  useEffect(() => {
    if (observedRef.current && hasMore) {
      observer.observe(observedRef.current)
    }
    return () => {
      observer.disconnect()
    }
  }, [users])

  useEffect(() => {
    setSkip(0)
    setHasMore(true)
    fetchUsers(false)

  }, [searchValue])

  const fetchUsers = async (loadMore: boolean) => {
    if (isFetching) return
    setIsFetching(true)
    const res = await fetch(`${URL}search?q=${searchValue}&limit=10&skip=${skip}`)
    const data = await res.json()
    if (data.users.length === 0 && loadMore) {
      setHasMore(false)
    } else {
      setSkip(prev => prev += data.users.length)
      if (skip === 0) {
        setUsers(data.users)
      } else {
        setUsers(prevUsers => [...prevUsers, ...data.users])
      }
    }
    setIsFetching(false)
  }

  const debounced = useDebouncedCallback((value) => {
    setSearchValue(value)
  }, 1000
  )

  const handleOnChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSkip(0)
    debounced(e.target.value)
  }

  return (
    <div className="h-full w-full max-w-md">
      <Header />
      <form className="w-full p-4 sticky top-0 bg-slate-800">
        <input className="w-full rounded-3xl bg-slate-700/50 p-2" type="text" placeholder=" search..." onChange={handleOnChange} />
      </form>
      <div className="flex flex-col">
        {!isFetching && users.length === 0 ? <div>No users found</div> :
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
        {isFetching && <div className="w-full text-center">Loading...</div>}
        <div className="my-8" ref={observedRef as any}></div>
      </div>
    </div>
  )
}
