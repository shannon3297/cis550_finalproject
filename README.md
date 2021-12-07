# cis550_finalproject

Welcome to fall 2021 cis550 group 22 final project! We are creating a web application that enables users to track company stock price over time with tagged significant company mentionings in Wall Street Journal and New York Times so that users can better understand historical context of stock highs/lows.

scrape_wsj.py scrapes articles from Wall Street Journal archive: https://www.wsj.com/news/archive/years

combine_csv.ipynb combines scraped articles within a month into a singular month csv.

clean_wsj_articles.ipynb cleans data and performs entity resolution as needed.

chromedriver is a webdriver used to scrape

seeking_alpha.py is an attempt to scrape from Seeking Alpha but the website blocks automated scraping.

clean_company_data.ipynb cleans data to ingest into our Company table
