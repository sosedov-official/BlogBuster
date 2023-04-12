import { withPageAuthRequired } from "@auth0/nextjs-auth0";
import { AppLayout } from "../components/AppLayout";
import { getAppProps } from "../utils/getAppProps";

export default function TokenTopup() {
  const handleClick = async (e) => {
    e.preventDefault();
    const result = await fetch(`/api/addTokens`, {
      method: "POST",
    });
    const json = await result.json();
    console.log("RESULT: ", json)
    window.location.href = json.session.url;
  };

  return (
    <div className="text-center">
      <form className='mx-auto my-36 w-full max-w-screen-sm bg-slate-100 p-4 rounded-md shadow-xl border border-slate-200 shadow-slate-200'>
        <div className="mt-3">
          <span className="text-3xl font-heading font-bold" >BlogBuster</span>
          <span className="font-body text-xl"> is currently in test mode</span>
        </div>
        <p className="mt-5">Follow the link below and enter random info to get 10 tokens for free</p>
        <p className="text-sm text-slate-500">e.g: use 4242 4242 4242 4242 for credit card number</p>
        <button className="btn mt-10" onClick={(e) => handleClick(e)}>Add tokens</button>
      </form>
    </div>
  );
}

TokenTopup.getLayout = function getLayout(page, pageProps) {
  return <AppLayout {...pageProps}>{page}</AppLayout>;
};

export const getServerSideProps = withPageAuthRequired({
  async getServerSideProps(ctx){
    const props = await getAppProps(ctx);
    return {
      props
    };
  },
});