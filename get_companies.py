import pandas as pd

companies = pd.read_csv("/Users/shayaz/Downloads/Stocks in the Russell 1000 Index.csv")

print(companies.columns)
companies = companies[["Symbol", "Description", "GICS Sector", "Market cap"]]
companies = companies.rename(columns={"Symbol": "Ticker", "GICS Sector": "Industry", "Market cap": "MarketCap"})
companies["MarketCap"] = companies["MarketCap"].map(lambda x: int(x.replace("$", "").replace(",", "")))
companies.to_csv("all_companies")