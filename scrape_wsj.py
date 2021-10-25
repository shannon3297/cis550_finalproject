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


# expand width of print statements
pd.set_option('display.max_columns', 500)
pd.set_option('display.width', 1000)

# chromedriver
# you can download the latest version of chromedriver here: https://chromedriver.chromium.org/downloads
# and grant access to chromedriver following these directions: https://stackoverflow.com/questions/60362018/macos-catalinav-10-15-3-error-chromedriver-cannot-be-opened-because-the-de
chromedriver_path = '/Users/shannonlin/Documents/F21/CIS550/Final Project/chromedriver'
wsj_url = 'https://www.wsj.com/news/archive/years'
try:
    driver = webdriver.Chrome(chromedriver_path)
    driver.get(wsj_url)
except:
    print("Error occured with inputted path to chromedriver. Either chromedriver wasn't properly downloaded or incorrect path was given. Exiting program, come back and try again")
    sys.exit()

# sign into WSJ
username = 'shannon3297@gmail.com'
pwd = 'cis550'
signed_in = input("Now sign into WSJ using username/password in script and return to https://www.wsj.com/news/archive/years, hit enter when done")

# set up csv to export data
with open(chromedriver_path.split('/chromedriver')[0] +'wsj_articles.csv', 'w') as f:
    wr = csv.writer(f)
    wr.writerow(['Title', 'Subtitle', 'Content'])
    # 2021 articles
    num_months = 1 # change to 12 to scrape entire year
    # num_days = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31] # number of days to scrape per month
    num_days = [1]
    for i in range(1,num_months+1):
        try:
            month = driver.find_element_by_xpath('//*[@id="root"]/div/div/div/div[2]/div[1]/ul/li[' + str(i) + ']/a')
            month.click()
            time.sleep(1)
            for j in range(1, num_days[i-1] + 1):
                day = driver.find_element_by_xpath('//*[@id="root"]/div/div/div/div[2]/div/ul/li[' + str(j) + ']/a')
                day.click()
                time.sleep(1)
                article_titles = driver.find_elements_by_xpath('//*[@id="main"]/div[1]/div/ol/article')
                time.sleep(1)
                # for article_idx in range(1, len(article_titles) + 1): # uncomment to get all articles in a particular day
                for article_idx in range(1, 3):
                    article_title = driver.find_element_by_xpath('//*[@id="main"]/div[1]/div/ol/article[' + str(article_idx) + ']/div[3]/div/h2/a/span')
                    article_title.click()
                    time.sleep(1)
                    # get title
                    try:
                        title = driver.find_element_by_xpath('//*[@id="main"]/header/div[2]/div/h1').text
                    except:
                        title  = 'No title'
                    print("title", title)
                    # get subtitle
                    try:
                        subtitle = driver.find_element_by_xpath('//*[@id="main"]/header/div[2]/div/h2').text
                    except:
                        subtite = "No subtitle"
                    print("subtitle", subtitle)
                    # get content
                    all_paragraphs = driver.find_elements_by_xpath('//*[@id="wsj-article-wrap"]/div[6]/p')
                    # all_paragraphs = driver.find_elements_by_css_selector('div.article-content+p')
                    # for paragraph in all_paragraphs:
                    #     content = content + paragraph.text + "\n"
                    content = ""
                    for paragraph_idx in range(1, len(all_paragraphs) + 1):
                        paragraph = driver.find_element_by_xpath('//*[@id="wsj-article-wrap"]/div[6]/p[' + str(paragraph_idx) + ']')
                        content = content + paragraph.text + "\n"
                    more_paragraphs = driver.find_elements_by_xpath('//*[@id="wsj-article-wrap"]/div[6]/div[2]/p')
                    for paragraph_idx in range(1, len(more_paragraphs) + 1):
                        paragraph = driver.find_element_by_xpath('//*[@id="wsj-article-wrap"]/div[6]/div[2]/p[' + str(paragraph_idx) + ']')
                        content = content + paragraph.text + "\n"
                    driver.back()
                    wr.writerow([title, subtitle, content])         
        except:
            print("Couldn't click into some element")

