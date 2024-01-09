export const boldHighlights = (name, search) => {

  const isMatch = name.toLowerCase().match(search.toLowerCase());
  if (isMatch) {
    const index = isMatch.index;

    if (index !== 0) {
      return <>
        {name.substr(0, index)}<strong>{name.substr(index, search.length)}</strong>{name.substr((index + search.length), name.length)}
      </>
    }
  }
  if (name.substr(0, search.length).toLowerCase() === search.toLowerCase()) {
    return <>
      <strong>{name.substr(0, search.length)}</strong>{name.substr(search.length)};
    </>
  }
  return name;
}