import Login from "@/module/auth/components/Login"

const LoginPage = async ({ searchParams }: { searchParams: Promise<{ redirect?: string }> }) => {
  const params = await searchParams
  return (
    <div>
        <Login redirectTo={params.redirect} />
    </div>
  )
}
export default LoginPage
