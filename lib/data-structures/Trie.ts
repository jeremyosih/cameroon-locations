interface TrieNode {
  children: Map<string, TrieNode>;
  isEndOfWord: boolean;
  data?: any;
}

export class Trie {
  private root: TrieNode;

  constructor() {
    this.root = {
      children: new Map(),
      isEndOfWord: false,
    };
  }

  insert(word: string, data: any): void {
    let current = this.root;
    const normalizedWord = word.toLowerCase();

    for (const char of normalizedWord) {
      if (!current.children.has(char)) {
        current.children.set(char, {
          children: new Map(),
          isEndOfWord: false,
        });
      }
      current = current.children.get(char)!;
    }

    current.isEndOfWord = true;
    current.data = data;
  }

  search(word: string): any[] {
    const results: any[] = [];
    const normalizedWord = word.toLowerCase();
    let current = this.root;

    for (const char of normalizedWord) {
      if (!current.children.has(char)) {
        return results;
      }
      current = current.children.get(char)!;
    }

    this.collectWords(current, results);
    return results;
  }

  private collectWords(node: TrieNode, results: any[]): void {
    if (node.isEndOfWord && node.data) {
      results.push(node.data);
    }

    for (const [_, childNode] of node.children) {
      this.collectWords(childNode, results);
    }
  }

  fuzzySearch(word: string, maxDistance: number = 2): any[] {
    const results: any[] = [];
    const normalizedWord = word.toLowerCase();

    this.fuzzySearchRecursive(
      this.root,
      normalizedWord,
      "",
      0,
      maxDistance,
      results
    );
    return results;
  }

  private fuzzySearchRecursive(
    node: TrieNode,
    word: string,
    currentWord: string,
    distance: number,
    maxDistance: number,
    results: any[]
  ): void {
    if (distance > maxDistance) return;

    if (node.isEndOfWord && node.data) {
      results.push({
        ...node.data,
        distance,
        match: currentWord,
      });
    }

    for (const [char, childNode] of node.children) {
      const newDistance =
        word.length > 0 && char !== word[0] ? distance + 1 : distance;
      this.fuzzySearchRecursive(
        childNode,
        word.length > 0 ? word.slice(1) : "",
        currentWord + char,
        newDistance,
        maxDistance,
        results
      );
    }
  }
}
