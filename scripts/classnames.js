export default (classObj) => {
    return Object.keys(classObj)
      .filter((className) => classObj[className])
      .join(' ');
  };