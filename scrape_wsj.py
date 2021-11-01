# this script scrapes WSJ articles from https://www.wsj.com/news/archive/years

# imports and google drive setup
from selenium import webdriver
import json
import pandas as pd
import os
import sys
import time
import csv
import re
import numpy as np
from selenium.common.exceptions import ElementClickInterceptedException, ElementNotInteractableException
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
chrome_options = Options()
# chrome_options.add_argument("--headless") # uncomment for faster runtime


# expand width of print statements
pd.set_option('display.max_columns', 500)
pd.set_option('display.width', 1000)

# chromedriver
# you can download the latest version of chromedriver here: https://chromedriver.chromium.org/downloads
# and grant access to chromedriver following these directions: https://stackoverflow.com/questions/60362018/macos-catalinav-10-15-3-error-chromedriver-cannot-be-opened-because-the-de
chromedriver_path = '/Users/shannonlin/Documents/F21/CIS550/Final Project/chromedriver'
wsj_url = 'https://www.wsj.com/news/archive/years'
try:
    driver = webdriver.Chrome(chromedriver_path, options=chrome_options)
    driver.get(wsj_url)
except:
    print("Error occured with inputted path to chromedriver. Either chromedriver wasn't properly downloaded or incorrect path was given. Exiting program, come back and try again")
    sys.exit()

# sign into WSJ
username = 'shannon3297@gmail.com'
pwd = 'cis550'
signed_in = input("Now sign into WSJ using username/password in script and return to https://www.wsj.com/news/archive/years, hit enter when done")
# print("path", chromedriver_path.split('chromedriver')[0] +'wsj_articles.csv')

# set up csv to export data
with open(chromedriver_path.split('chromedriver')[0] +'wsj_articles.csv', 'w', encoding='utf-8-sig') as f:
    wr = csv.writer(f)
    wr.writerow(['Article URL', 'Date', 'Title', 'Subtitle', 'Content'])
    # 2021 articles
    num_months = 1 # change to 12 to scrape entire year
    # added dummy so indices match up to months, ex 2 = February 
    months = ['dummy', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    num_days = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31] # number of days to scrape per month
    initial = 3
    # month
    for i in range(initial,initial+num_months): 
        try:
            # month = driver.find_element_by_xpath('//*[@id="root"]/div/div/div/div[2]/div[1]/ul/li[' + str(i) + ']/a')
            # month.click()
            driver.get('https://www.wsj.com/news/archive/2021/' + months[i])
            time.sleep(1)
        except:
            print("Couldn't click into month", str(i))
            continue
        try:
            # day
            for j in range(1, num_days[i-1] + 1):
            # for j in range(1, 20):
            # for j in range(11, 21):
                # day = driver.find_element_by_xpath('//*[@id="root"]/div/div/div/div[2]/div/ul/li[' + str(j) + ']/a')
                # day.click()
                driver.get('https://www.wsj.com/news/archive/2021/' + str(i).zfill(2) + '/' + str(j).zfill(2))
                time.sleep(1)
                article_titles = driver.find_elements_by_xpath('//*[@id="main"]/div[1]/div/ol/article')
                time.sleep(1)
                # article
                for article_idx in range(1, len(article_titles) + 1): # uncomment to get all articles in a particular day
                # for article_idx in range(16, len(article_titles) + 1): # uncomment to test in smaller articles/day
                # for article_idx in range(1, 12):
                    category = driver.find_element_by_xpath('//*[@id="main"]/div[1]/div/ol/article[' + str(article_idx) + ']/div[2]/div/span')
                    # skip crossword articles lol
                    if category.text.lower() == 'crossword':
                        driver.back()
                        continue
                    try:
                        article_title = driver.find_element_by_xpath('//*[@id="main"]/div[1]/div/ol/article[' + str(article_idx) + ']/div[3]/div/h2/a/span')
                        article_title.click()
                        time.sleep(1)
                    except:
                        print("Couldn't click into article", str(article_idx), "for month", str(i), "day", str(j))
                    # get url
                    try:
                        url = driver.current_url
                    except:
                        url = ""
                    # print("url", url)
                    # get date
                    try:
                        currDate = str(i) + "/" + str(j) + "/21"
                    except:
                        currDate = ""
                    # print("currDate", currDate)
                    # get title
                    try:
                        title = driver.find_element_by_xpath('//*[@id="main"]/header/div[2]/div/h1').text
                    except:
                        try:
                            title = driver.find_element_by_xpath('//*[@id="bigTopBox"]/div/div[3]/h1').text
                        except:
                            try:
                                title = driver.find_element_by_xpath('//*[@id="article-contents"]/header/div/div/h1').text
                            except:
                                try:
                                    title = driver.find_element_by_xpath('//*[@id="bigTopBox"]/div/div[2]/h1').text
                                except:
                                    title = ""
                    # ignore these types of articles
                    if title == 'Pepper...and Salt':
                        driver.back()
                        continue
                    # print("title", title)
                    # get subtitle
                    try:
                        subtitle = driver.find_element_by_xpath('//*[@id="main"]/header/div[2]/div/h2').text
                    except:
                        try:
                            subtitle = driver.find_element_by_xpath('//*[@id="bigTopBox"]/div/div[3]/h2').text
                        except:
                            try:
                                subtitle = driver.find_element_by_xpath('//*[@id="article-contents"]/header/div/div/h2').text
                            except:
                                try:
                                    subtitle = driver.find_element_by_xpath('//*[@id="bigTopBox"]/div/div[2]/h2').text
                                except:
                                    subtitle = ""
                    # print("subtitle", subtitle)
                    # get content
                    content = ""
                    paragraphs = driver.find_elements_by_xpath('//*[@id="wsj-article-wrap"]/div[6]/p')
                    for paragraph_idx in range(1, len(paragraphs) + 1):
                        try:
                            paragraph = driver.find_element_by_xpath('//*[@id="wsj-article-wrap"]/div[6]/p[' + str(paragraph_idx) + ']')
                            currText = paragraph.text
                            # print("currText", currText)
                            content = content + currText + "\n"
                        except:
                            print("Couldn't get content from article", str(article_idx), "on month", str(i), "day", str(j)) 
                    more_paragraphs = driver.find_elements_by_xpath('//*[@id="wsj-article-wrap"]/div[6]/div[2]/p')
                    for paragraph_idx in range(1, len(more_paragraphs) + 1):
                        try:
                            paragraph = driver.find_element_by_xpath('//*[@id="wsj-article-wrap"]/div[6]/div[2]/p[' + str(paragraph_idx) + ']')
                            content = content + paragraph.text + "\n"
                        except:
                            print("Couldn't get more content from article", str(article_idx), "on month", str(i), "day", str(j)) 
                    even_more_paragraphs = driver.find_elements_by_xpath('//*[@id="wsj-article-wrap"]/div[5]/p')
                    for paragraph_idx in range(1, len(even_more_paragraphs) + 1):
                        try:
                            paragraph = driver.find_element_by_xpath('//*[@id="wsj-article-wrap"]/div[5]/p[' + str(paragraph_idx) + ']')
                            content = content + paragraph.text + "\n"
                        except:
                            print("Couldn't get even more content from article", str(article_idx), "on month", str(i), "day", str(j)) 
                    additional_paragraphs = driver.find_elements_by_xpath('//*[@id="wsj-article-wrap"]/div[5]/div[3]/p')
                    for paragraph_idx in range(1, len(additional_paragraphs) + 1):
                        try:
                            paragraph = driver.find_element_by_xpath('//*[@id="wsj-article-wrap"]/div[5]/div[3]/p[' + str(paragraph_idx) + ']')
                            content = content + paragraph.text + "\n"
                        except:
                            print("Couldn't get even more content from article", str(article_idx), "on month", str(i), "day", str(j)) 
                    # print("content", content)
                    driver.back()
                    wr.writerow([url, currDate, title, subtitle, content]) 
                    print("Finished exporting data from article", str(article_idx), "on month", str(i), "day", str(j)) 
                    time.sleep(1)      
        except:
            print("Couldn't click into some element for month", str(i), "day", str(j))
            continue

