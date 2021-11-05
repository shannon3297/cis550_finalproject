# this script scrapes Seeking Alpha articles from 'https://seekingalpha.com/market-news/'

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

# SCRAPING Seeking Alpha
staging = True # Do the whole thing or not

chromedriver_path = '/Users/shannonlin/Documents/F21/CIS550/Final Project/chromedriver'
sa_url = 'https://seekingalpha.com/market-news/'
try:
    driver = webdriver.Chrome(chromedriver_path, options=chrome_options)
    driver.get(sa_url)
except:
    print("Error occured with inputted path to chromedriver. Either chromedriver wasn't properly downloaded or incorrect path was given. Exiting program, come back and try again")
    sys.exit()

move_on = input("Type enter when ready")

# Get all the months
N = 900 # number of pages
link_list = []
for i in range(1, N):
  # Get to URL
  driver.get(sa_url + str(i))
  time.sleep(1)
  driver.save_screenshot('screenie.png')


  # Extract links of articles
  article_elements = driver.find_elements_by_xpath('//*[@id="latest-news-list"]/li/h4/a')
  for e in article_elements:
    link_list.append(e.get_attribute('href'))
  print(link_list)
  if staging:
    break


for l in link_list:
  # Get to URL
  driver.get(l)
  sleep(1)

  # Extract title, date and content
  title = driver.find_element_by_xpath('//*[@data-test-id="post-title"]').get_attribute('innerHTML')
  date = driver.find_element_by_xpath('//*[@data-test-id="post-date"]').get_attribute('innerHTML')
  # can get ticker later
  content = driver.find_element_by_xpath('//*[@data-test-id="content-container"]').get_attribute('innerHTML')
  print(content)
