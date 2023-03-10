import Layout from "../components/Layout"
import Navigation, { Section } from "../components/Navigation"
import NavigationLink from "../components/NavigationLink"
import Text from "../components/Text"

export default function IndexRoute() {
  return (
    <Layout>
      <Navigation>
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
