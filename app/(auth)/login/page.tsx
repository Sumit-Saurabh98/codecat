import Login from "@/module/auth/components/Login"
import { requireUnAuth } from "@/module/auth/utils/auth-utils"

const LoginPage = async ({ searchParams }: { searchParams: { redirect?: string } }) => {
    await requireUnAuth()
  return (
    <div>
        <Login redirectTo={searchParams.redirect} />
    </div>
  )
}
export default LoginPage
