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
  const prevSearchValue = useRef(searchValue)

  const intersectionCallback = (entries: IntersectionObserverEntry[]) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        prevSearchValue.current = searchValue
        debounceFetch()
      }
    });
  }
  let observer = new IntersectionObserver(intersectionCallback);

  useEffect(() => {
    if (observedRef.current) {
      observer.observe(observedRef.current)
    }
    return () => {
      observer.disconnect()
    }
  }, [users])

  useEffect(() => {
    setSkip(0)
    debounceFetch()

  }, [searchValue])

  const fetchUsers = async () => {
    if (isFetching) return

    setIsFetching(true)

    const res = await fetch(`${URL}search?q=${searchValue}&limit=10&skip=${skip}`)
    const data = await res.json()

    if (data.total <= 10 || data.total === skip) {
      setHasMore(false)
    } else {
      setHasMore(true)
    }

    setSkip(prev => prev += data.users.length)
    if (searchValue !== prevSearchValue.current) {
      setUsers(data.users)
    } else {
      setUsers(prevUsers => [...prevUsers, ...data.users])
    }

    setIsFetching(false)
  }

  const debounceFetch = useDebouncedCallback(() => {
    fetchUsers()
  }, 500
  )

  const handleOnChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSkip(0)
    prevSearchValue.current = searchValue
    setSearchValue(e.target.value)
  }

  return (
    <div className="h-full w-full max-w-md">
      <Header />
      <div className="flex flex-col shadow shadow-slate-900">
        <form className="sticky top-0 w-full bg-slate-900/10 p-4">
          <input className="w-full rounded-3xl bg-gray-700 p-2 shadow-inner shadow-gray-900" type="text" placeholder=" search..." onChange={handleOnChange} />
        </form>
        {!isFetching && users.length === 0 ? <div>No users found</div> :
          users?.map((user) => (
            <div key={user.id} className="flex w-full border-t border-t-gray-700/30 bg-gray-900/10 p-4">
              <div className="flex flex-row gap-1">
                <img className="size-24" src={user.image}></img>
                <div className="flex flex-col break-all ">
                  <p>{user.firstName} {user.lastName}</p>
                  <p>{user.phone}</p>
                  <p>{user.email}</p>
                </div>
              </div>
            </div>
          ))
        }
        {isFetching && <div className="w-full text-center">Loading...</div>}
        {hasMore &&
          <div className="my-8" ref={observedRef as any}></div>
        }
      </div>
    </div>
  )
}
