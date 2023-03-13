import { json, LoaderArgs } from "@remix-run/node"
import Layout from "../components/Layout"
import Navigation, { Section } from "../components/Navigation"
import NavigationLink from "../components/NavigationLink"
import useLoaderData from "../useLoaderData"

const loader = async (args: LoaderArgs) => {
  return json({ dnHost: process.env.GAMING_ASSETS_WEB_HOST ?? "" })
}

export default function IndexRoute() {
  const { cdnHost } = useLoaderData()

  return (
    <Layout>
      <Navigation cdnHost={cdnHost}>
        <Section>
          <NavigationLink href="/">home</NavigationLink>
          <NavigationLink href="/collections/continue-playing">
            browse
          </NavigationLink>
        </Section>
      </Navigation>
    </Layout>
  )
}
