"use client"
import { signOut } from "@/lib/auth-client"
import { useRouter } from "next/navigation"
const Logout = ({
    children,
    className
}:{children: React.ReactNode, className?: string}) => {

    const router = useRouter()

  return (
    <span onClick={() => signOut({
        fetchOptions:{
            onSuccess:() =>{
                router.push("/login")
            }
        }
    })} className={className}>{children}</span>
  )
}
export default Logout