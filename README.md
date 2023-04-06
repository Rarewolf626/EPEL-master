# Project of Data Visualization (COM-480)

| Student's name | SCIPER |
| -------------- | ------ |
| Métivier Antoine | 297138 |
| Mettler Julien | 309999 |
| Monnin Etienne | 295852 |
| | |

[Milestone 1](#milestone-1) • [Milestone 2](#milestone-2) • [Milestone 3](#milestone-3)

## Milestone 1 (7th April, 5pm)

**10% of the final grade**

This is a preliminary milestone to let you set up goals for your final project and assess the feasibility of your ideas.
Please, fill the following sections about your project.

*(max. 2000 characters per section)*

### Dataset

> Find a dataset (or multiple) that you will explore. Assess the quality of the data it contains and how much preprocessing / data-cleaning it will require before tackling visualization. We recommend using a standard dataset as this course is not about scraping nor data processing.
>
> Hint: some good pointers for finding quality publicly available datasets ([Google dataset search](https://datasetsearch.research.google.com/), [Kaggle](https://www.kaggle.com/datasets), [OpenSwissData](https://opendata.swiss/en/), [SNAP](https://snap.stanford.edu/data/) and [FiveThirtyEight](https://data.fivethirtyeight.com/)), you could use also the DataSets proposed by the ENAC (see the Announcements section on Zulip).

1. **[MyAnimeList Dataset](https://www.kaggle.com/azathoth42/myanimelist)**: contains data that was scrapped from [MyAnimeList](https://myanimelist.net) website, a social network and catalogue centered around animes and mangas. The dataset contains information on 302,673 users and 14,478 animes, and is composed of three main files:
    - [UserList.csv](data/UserList.csv) contains information about the users, such as the username, location, birthdate. The dataset also comprises a filtered version which retains only the users who have all of birth date, location, and gender defined, and a cleaned version which additionally removes users who have "suspicious" values (too many watched episodes, too young or too old, etc.): [users_filtered.csv](data/users_filtered.csv) and [users_cleaned.csv](data/users_cleaned.csv)
    - [AnimeList.csv](data/AnimeList.csv) contains information about the anime, such as the title, genres, studio, the URL of the image, among others. The dataset includes as well a filtered and cleaned version which remove the ratings from the users of the corresponding filtered and cleaned user datasets: [anime_filtered.csv](data/anime_filtered.csv) and [anime_cleaned.csv](data/anime_cleaned.csv)
    - [UserAnimeList.csv](data/UserAnimeList.csv) contains the anime lists of all users. As the file exceeds the maximum size of 100MB allowed by GitHub, it needs to downloaded separately [here](https://www.kaggle.com/datasets/azathoth42/myanimelist?select=UserAnimeList.csv).
2. **[Anime Recommendations Database vol.2](https://www.kaggle.com/datasets/noiruuuu/anime-recommendations-database-vol2)**: gathers 11,039,694 ratings from 108,024 MyAnimeList users on 15,221 animes.
    - [animes.csv](data/animes.csv) contains information about the anime, similarly as AnimeList.csv
    - [ratings.csv](data/ratings.csv) contains the ratings, ranging from 0 to 10. Must be downloaded separataly [here](https://www.kaggle.com/datasets/noiruuuu/anime-recommendations-database-vol2?select=ratings.csv)
3. **[Anime Character Traits Dataset](https://www.kaggle.com/datasets/mjrone/anime-character-traits-dataset?select=Anime_Triats.csv)**: contains information on 119,824 anime characters such as their name, gender, hair color, their physical and temperamental traits, or the anime they appear in. The data was scrapped from [Anime Characters Database](https://www.animecharactersdatabase.com). 
    - [Anime_Traits.csv ](data/Anime_Traits.csv) contains the data about the characters.



### Problematic

> Frame the general topic of your visualization and the main axis that you want to develop.

Japan's worldwide influence through animes

The main topic of this project is to explore the spread of Japan's culture worldwide, by visualizing the global popularity and reach of anime as a form of entertainment. We will mainly focus on showcasing the widespread viewership of these art industry across different countries, cultures, and age groups.

> - What am I trying to show with my visualization?

The purpose of our visualization project is to showcase the global popularity of anime industry, an art form with a wide variety of genres that appeal to diverse audiences worldwide, to the point of becoming a major contributor to Japan's soft power strategy. Anime features characters that are relatable and resonate with people across different cultures, regions and age groups, contributing to its worldwide appreciation.


> - Think of an overview for the project, your motivation, and the target audience.

Our project will highlight the preferred anime genres, characters, studios and their popularity in various countries while analyzing patterns that may emerge across countries, age groups or genders.
Furthermore, we intend to stress and compare the exportability of the various animation studios' artworks. 
By doing so, we hope to demonstrate to the viewers how anime has become a unifying force in today's globalized world.
The target audience for this project includes anime enthusiasts but also researchers and academics who are interested in distinguishing trends in entertainment on a global scale, or in analyzing the cultural policies of Japan.

### Exploratory Data Analysis

> Pre-processing of the data set you chose
> - Show some basic statistics and get insights about the data

We divided our data analysis into three main axes:

#### Mapping location data to countries ([eda_country.ipynb](/preprocessing/eda_country.ipynb))

As we are interested in the worldwide influence of animes, we began by cleaning the location data that was scrapped from MyAnimeList in UserList and mapping it to the corresponding countries, if possible. We applied a function to the unique 55280 location strings retrieved from the 302673 users of the dataset, that leverages [GeoPy's API](https://geopy.readthedocs.io/en/stable/#) geolocation services to resolve the full location from the string, and keep only the country name. Many location strings (in total 10%) failed however to be mapped, for one of the following reasons:
- The string contains typos (e.g. "Las Veags,Nevada") which are not recognized by the geocoding service. Translating the string to English (using []()) corrects some of them
- The string is fictional (e.g. "Mordor, Middle-Earth") or not a location at all (e.g. "1871", "I don't think soo")
- The string contains additional words that make the geocoder fail, e,g., "Portland Oregon AKA The city of roses".
In total, 15595 users (9.95%) have a undefined country.

Below we plot the countries having the most number of users:
United States is largely represented, which is not surprising given that MyAnimeList was founded and is based in this country.

![Number of users per country](data/plots/Number%20of%20users%20per%20country.png)

We are also interested in the studios whose animes are watched in the highest number of countries:

![Number of countries per studio](data/plots/Number%20of%20country%20per%20Studio.png)

We observe that the most popular studios worldwide do not necessarily produce the most popular animes in terms of ratings:

![Number of ratings per Studio](data/plots/Number%20of%20ratings%20per%20Studio.png)


#### Genres ([eda_genre.ipynb](/preprocessing/eda_genre.ipynb))
We are also interested in the most popular genres in terms of number of animes:

![Number of anime per genre](/data/plots/Number%20of%20anime%20per%20genre.png)


#### Characters ([eda_character.ipybb](/preprocessing/eda_character.ipynb))
Finally, we derived the most common traits of anime characters. 

![Most common traits for animes characteristics](/data/plots/Most%20common%20traits%20for%20animes%20characters.png)


### Related work

> - What others have already done with the data?

The [worldwideweebz](https://github.com/com-480-data-visualization/com-480-project-worldwideweebz) group already used the MyAnimeList dataset in 2020 for this class.

> - Why is your approach original?


> - What source of inspiration do you take? Visualizations that you found on other websites or magazines (might be unrelated to your data).


## Milestone 2 (7th May, 5pm)

**10% of the final grade**


## Milestone 3 (4th June, 5pm)

**80% of the final grade**


## Late policy

- < 24h: 80% of the grade for the milestone
- < 48h: 70% of the grade for the milestone

