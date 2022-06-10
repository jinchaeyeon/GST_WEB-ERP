import { useCallback, useEffect, useState } from "react";
//import Movie from "../components/Movie";

import { useApi } from "../hooks/api";

function Main() {
  const [loading, setLoading] = useState(true);
  const [movies, setMovies] = useState([]);

  const processApi = useApi();
  const processTEST = useCallback(async () => {
    //console.log("processLogin", formData);
    try {
      console.log("sstart");
      const response = await processApi<any>("test");

      console.log("response!!!");
      console.log(response);
    } catch (e) {
      console.log(e);
    }
  }, []);

  const getMovies = async () => {
    console.log(2);
    const json = await fetch(`125.141.105.80:50555/api/data/procedure`);

    console.log(json);

    const json2 = await json.json();

    console.log(json2);
    //setMovies(json);
    setLoading(false);
  };
  useEffect(() => {
    console.log(1);
    //getMovies();

    processTEST();
  }, []);
  return (
    <div>
      {loading ? (
        <div>
          <span>Loading...</span>
        </div>
      ) : (
        <div>
          {movies.map((movie) => (
            <div>1</div>
            /* <Movie
              key={movie.id}
              id={movie.id}
              year={movie.year}
              coverImg={movie.medium_cover_image}
              title={movie.title}
              summary={movie.summary}
              genres={movie.genres}
            />*/
          ))}
        </div>
      )}
    </div>
  );
}
export default Main;
