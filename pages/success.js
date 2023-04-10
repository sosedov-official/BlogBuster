import { withPageAuthRequired } from "@auth0/nextjs-auth0";
import { AppLayout } from "../components/AppLayout";
import { getAppProps } from "../utils/getAppProps";
import Link from "next/link";

export default function Success() {
  return (
    <div className="text-center">
      <form className='mx-auto my-36 w-full max-w-screen-sm bg-slate-100 p-4 rounded-md shadow-xl border border-slate-200 shadow-slate-200'>
        <h1>
          Thank you for your purchase!
        </h1>
        <Link href="/post/new" legacyBehavior>
          <a className="btn mt-10">Generate a New Blog</a>
        </Link>
      </form>
    </div>
  );
}

Success.getLayout = function getLayout(page, pageProps) {
  return <AppLayout {...pageProps}>{page}</AppLayout>;
};

export const getServerSideProps = withPageAuthRequired({
  async getServerSideProps(ctx){
    const props = await getAppProps(ctx)
    return {
      props
    };
  },
});