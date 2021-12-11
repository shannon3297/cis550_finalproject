from yfinance import Ticker
import pandas as pd

companies = pd.read_csv("/Users/shayaz/Downloads/Stocks in the Russell 1000 Index.csv")
ct = 0
all_stocks = pd.DataFrame()
for company in companies["Symbol"]:
    tick = Ticker(company)
    info = None
    hist = tick.history(period="max")
    hist["ticker"] = company
    all_stocks = pd.concat([all_stocks, hist])
    ct += 1
    print(ct)

all_stocks.to_csv("all_tickers")