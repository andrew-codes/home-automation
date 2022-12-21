interface ContentTypeRule {
  (id: string): Promise<string | null>
}
interface IsAMatch<T> {
  (input: T): boolean
}

const matchesPng: IsAMatch<string> = (id) => {
  return /\.png$/.test(id)
}
const matchesJpg: IsAMatch<string> = (id) => {
  return /\.jpe?g$/.test(id)
}

const jpgContentType: ContentTypeRule = async () => "image/jpg"
const pngContentType: ContentTypeRule = async () => "image/png"
const noContentType: ContentTypeRule = async () => null

const conditionalRule =
  (specfication: IsAMatch<string>, rule: ContentTypeRule): ContentTypeRule =>
  async (id) =>
    specfication(id) ? rule(id) : noContentType(id)

const firstValid =
  (supportedContentTypeRules: ContentTypeRule[]): ContentTypeRule =>
  async (id) =>
    (
      await await Promise.all(supportedContentTypeRules.map((rule) => rule(id)))
    ).find((contentType) => contentType !== null) ?? null

const getContentType: ContentTypeRule = firstValid([
  conditionalRule(matchesPng, pngContentType),
  conditionalRule(matchesJpg, jpgContentType),
])

export default getContentType
