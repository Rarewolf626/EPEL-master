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

1. **[MyAnimeList Dataset](https://www.kaggle.com/azathoth42/myanimelist)**: contains data that was scrapped from [MyAnimeList (MAL) website](https://myanimelist.net). It contains information about anime, manga, characters, people, and reviews. The dataset is available on [Kaggle] and is updated every month.
    - [UserList.csv](data/UserList.csv) contains information about the users of MAL, such as the username, location, birthdate. The dataset also comprises a filtered version which consists in only the users who have all of birth date, location, and gender defined, and a cleaned version which additionally removes users who have "suspicious" values (too many episodes watches, too young or too old, etc.).
        - [users_filtered.csv](data/users_filtered.csv) contains the data about the users.
        - [users_cleaned.csv](data/users_cleaned.csv) contains the data about the users.
    - [AnimeList.csv](data/AnimeList.csv) contains the data about the anime. The dataset includes as well a filtered and cleaned version which remove the ratings from the users of the corresponding filtered and cleaned user datasets.
        - [anime_filtered.csv](data/anime_filtered.csv)
        - [anime_cleaned.csv](data/anime_cleaned.csv)
    - [UserAnimeList.csv](data/UserAnimeList.csv) contains the data about the anime. As the file exceeds the maximum size of 100MB, it is not available on GitHub.
2. **[Anime Recommendations Database vol.2]()**: contains data that was scrapped from MAL website as well.
    - [animes.csv](data/animes.csv) contains the data about the anime.
    - [ratings.csv]() contains the data about the ratings.
3. **[Anime Character Traits Dataset](https://www.kaggle.com/datasets/mjrone/anime-character-traits-dataset?select=Anime_Triats.csv)**: contains information on anime characters such as their name, gender, hair color, their physical and temperamental traits, the anime/manga they appear in. The data was scrapped from [Anime Characters Database (ADB) website](https://www.animecharactersdatabase.com). 
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

The [UserList.csv](data/UserList.csv) file contains the most number of users (116,133). Based on


Histogram: group by genre

Histogram: users per country

Histogram: genres which have the best ratings

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

