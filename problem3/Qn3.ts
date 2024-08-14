
/*
Issues and Improvements:

Issue: Incorrect Dependency in useMemo Hook
Problem: The useMemo hook for sortedBalances includes prices as a dependency, but prices is not used within the useMemo callback, which can cause unnecessary re-computations whenever prices changes.
Solution: Remove prices from the dependency array in useMemo.

Issue: Inefficient Filtering and Sorting Logic
Problem: The filtering and sorting logic in the useMemo hook is complex and potentially incorrect. The filter condition checks whether lhsPriority > -99 and then whether balance.amount <= 0, but they should not be performed together.
Solution: Simplify the logic to make it clearer and more efficient. Ensure that the filter logic correctly reflects the desired condition.

Issue: Incorrect Use of blockchain Property
Problem: The blockchain property is accessed on balance, but the WalletBalance interface does not define a blockchain property.
Solution: Add the blockchain property to the WalletBalance interface or clarify the structure of the balance object.

Issue: Error Handling
Problem: The console.err(error) statement contains a typo (console.err should be console.error).
Solution: Correct the typo to console.error(error).

Issue: Repeated Mapping Over sortedBalances
Problem: sortedBalances is mapped twice: once to create formattedBalances and once to generate the rows.
Solution: Combine the two map operations into a single iteration.

Issue: Inefficient State Handling
Problem: prices are fetched in a useEffect and stored in state, useMemo can directly return the prices after they are fetched, removing the need for the additional state and side effect.
Solution: Refactor the code to avoid unnecessary state management for prices.

Issue: Missing Dependency in useEffect Hook
Problem: The useEffect hook for fetching prices does not include Datasource as a dependency, it’s a good practice to ensure that any dependencies that could change are correctly managed.
Solution: Ensure that the Datasource class is static and will not change across renders, or use dependency management if needed. 
*/


import React, { useEffect, useMemo, useState } from 'react';
import { BoxProps } from '@mui/material';
import { useWalletBalances } from './useWalletBalances';
import WalletRow from './WalletRow';

interface WalletBalance {
  currency: string;
  amount: number;
  blockchain: string;
}

interface FormattedWalletBalance extends WalletBalance {
  formatted: string;
}

interface Props extends BoxProps {
  children?: React.ReactNode; 
  className?: string;
}

class Datasource {
  private url: string;

  constructor(url: string) {
    this.url = url;
  }

  async getPrices(): Promise<{ [currency: string]: number }> {
    try {
      const response = await fetch(this.url);
      if (!response.ok) {
        throw new Error('Failed to fetch prices');
      }
      return response.json();
    } catch (error) {
      console.error('Error fetching prices:', error);
      throw error;
    }
  }
}

const WalletPage: React.FC<Props> = (props: Props) => {
  const { children, className, ...rest } = props;
  const balances = useWalletBalances();
  const [prices, setPrices] = useState<{ [currency: string]: number }>({});

  useEffect(() => {
    const datasource = new Datasource("https://interview.switcheo.com/prices.json");
    datasource.getPrices()
      .then(prices => setPrices(prices))
      .catch(error => console.error(error));
  }, []);

  const getPriority = (blockchain: string): number => {
    switch (blockchain) {
      case 'Osmosis':
        return 100;
      case 'Ethereum':
        return 50;
      case 'Arbitrum':
        return 30;
      case 'Zilliqa':
      case 'Neo':
        return 20;
      default:
        return -99;
    }
  };

  const sortedBalances = useMemo(() => {
    return balances
      .filter(balance => getPriority(balance.blockchain) > -99 && balance.amount > 0)
      .sort((lhs, rhs) => getPriority(rhs.blockchain) - getPriority(lhs.blockchain));
  }, [balances]);

  const rows = sortedBalances.map((balance: WalletBalance, index: number) => {
    const usdValue = prices[balance.currency] * balance.amount;
    return (
      <WalletRow
        className={className || ''} 
        amount={balance.amount}
        usdValue={usdValue}
        formattedAmount={balance.amount.toFixed(2)}
      />
    );
  });

  return (
    <div {...rest} className={className}>
      {children}
      {rows}
    </div>
  );
};

export default WalletPage;
