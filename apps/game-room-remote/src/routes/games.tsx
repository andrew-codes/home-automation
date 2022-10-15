import Filters from "../components/Filters"
import Layout from "../components/Layout"
import Navigation, { Section } from "../components/Navigation"
import NavigationLink from "../components/NavigationLink"
import Text from "../components/Text"

function Games() {
  return (
    <Layout>
      <Navigation>
        <Section>
          <NavigationLink href="/">home</NavigationLink>
          <NavigationLink href="/games">browse</NavigationLink>
        </Section>
        <Section>
          <Filters />
        </Section>
      </Navigation>
      <Text as="h1">Browse</Text>
    </Layout>
  )
}

export default Games
