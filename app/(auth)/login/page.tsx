import Login from "@/module/auth/components/Login"
import { requireUnAuth } from "@/module/auth/utils/auth-utils"

const LoginPage = async () => {
    await requireUnAuth()
  return (
    <div>
        <Login/>
    </div>
  )
}
export default LoginPage