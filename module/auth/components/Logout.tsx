"use client"
import { signOut } from "@/lib/auth-client"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { ConfirmDialog } from "@/components/confirm-dialog"

const Logout = ({
    children,
    className
}:{children: React.ReactNode, className?: string}) => {
    const router = useRouter()
    const [showConfirm, setShowConfirm] = useState(false)
    const [isLoggingOut, setIsLoggingOut] = useState(false)

    const handleLogout = async () => {
        if (isLoggingOut) return

        setIsLoggingOut(true)
        try {
            await signOut({
                fetchOptions:{
                    onSuccess:() =>{
                        router.push("/login")
                    }
                }
            })
        } catch (error) {
            console.error("Logout error:", error)
            setIsLoggingOut(false) // Reset on error
        }
    }

    const openConfirmDialog = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setShowConfirm(true)
    }

  return (
    <>
      <span
          onClick={openConfirmDialog}
          className={className}
      >
          {children}
      </span>

      <ConfirmDialog
        open={showConfirm}
        onOpenChange={setShowConfirm}
        title="Sign Out"
        description="Are you sure you want to sign out of your account? You'll need to sign in again to access your dashboard."
        confirmText="Sign Out"
        cancelText="Cancel"
        onConfirm={handleLogout}
        variant="destructive"
        loading={isLoggingOut}
      />
    </>
  )
}
export default Logout
