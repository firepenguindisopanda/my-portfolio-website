import React from 'react';
import { Link } from 'react-router-dom';
import { profile } from '../../data/profile';
import { FooterNap } from '../panda/LazyScenes';

/**
 * The night strip that closes every page: who and where, the practice
 * profiles, and a way back up. The motto that used to live here keeps its spot.
 */
const EXT = { target: '_blank', rel: 'noopener noreferrer' };

const SiteFooter = () => (
  <footer className="site-footer">
    <div className="wrap">
      <span>
        {profile.name}, {profile.location}. {profile.personal.motto}.
        <FooterNap />
      </span>
      <ul>
        <li><a href={profile.links.github} {...EXT}>GitHub<span className="sr-only"> (opens in a new tab)</span></a></li>
        <li><a href={profile.links.codewars} {...EXT}>Codewars<span className="sr-only"> (opens in a new tab)</span></a></li>
        <li><a href={profile.links.leetcode} {...EXT}>LeetCode<span className="sr-only"> (opens in a new tab)</span></a></li>
        <li><Link to="/about-panda">About the panda</Link></li>
        <li><a href="#top">Back to top</a></li>
      </ul>
    </div>
  </footer>
);

export default SiteFooter;
